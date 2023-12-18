"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const express_1 = require("express");
const db_1 = require("../../client/db");
const uuid_1 = require("uuid");
const RazorPayInstance_1 = require("../../config/RazorPayInstance");
const crypto_1 = __importDefault(require("crypto"));
const transporter_1 = __importDefault(require("../../utils/transporter"));
const courseEnrollment_1 = require("../../mail/templates/courseEnrollment");
const paymentSuc_1 = require("../../mail/templates/paymentSuc");
const PaymentResponses = {
    success: false,
    course: {},
    message: "",
    totalAmount: 0,
};
const mutations = {
    capturePayment: (parent, { courses }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (courses.length === 0) {
                PaymentResponses.message = "course is empty";
                return express_1.response;
            }
            let total_amount = 0;
            for (const course_id of courses) {
                try {
                    // Find the course by its ID
                    let course = yield db_1.prismaClient.course.findUnique({
                        where: { id: course_id },
                    });
                    // If the course is not found, return an error
                    if (!course) {
                        PaymentResponses.message = "course not found";
                        return PaymentResponses;
                    }
                    // Check if the user is already enrolled in the course
                    const userDetail = yield db_1.prismaClient.course.findUnique({
                        where: { id: context.DecodedUser.id },
                        include: {
                            studentsEnroled: true,
                        },
                    });
                    if (!userDetail) {
                        PaymentResponses.message = "user not found";
                        return PaymentResponses;
                    }
                    const enrolledStudent = userDetail.studentsEnroled.includes(context.DecodedUser.id);
                    if (enrolledStudent) {
                        PaymentResponses.message = "student already enrolled";
                        return PaymentResponses;
                    }
                    // Add the price of the course to the total amount
                    total_amount += course.price;
                }
                catch (error) {
                    console.log(error);
                }
            }
            const options = {
                amount: total_amount * 100,
                currency: "INR",
                receipt: (0, uuid_1.v4)(),
            };
            try {
                const paymentResponse = yield RazorPayInstance_1.razorpatInstance.orders.create(options, function (err, order) {
                    console.log(order);
                    if (err) {
                        console.log(err);
                    }
                });
                console.log(paymentResponse);
                PaymentResponses.message = "payment response successfully";
                PaymentResponses.success = true;
                return paymentResponse;
            }
            catch (error) {
                console.log(error);
                PaymentResponses.message = "payment response Unsuccessfully";
                return PaymentResponses;
            }
        }
        catch (error) {
            console.log(error);
            PaymentResponses.message = "error in createpayment";
            return PaymentResponses;
        }
    }),
    verifyPayment: (parent, { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses, }, context) => __awaiter(void 0, void 0, void 0, function* () {
        let body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");
        if (expectedSignature === razorpay_signature) {
            yield enrollStudents(courses, context.DecodedUser.id);
            PaymentResponses.message = "Payment Verification successful";
            PaymentResponses.success = true;
            return PaymentResponses;
        }
        PaymentResponses.message = "Payment Verification failed";
        return PaymentResponses;
    }),
    sendPaymentSuccessEmail: (parent, { orderId, paymentId, amount }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const enrolledStudent = yield db_1.prismaClient.user.findUnique({
                where: {
                    id: context.DecodedUser.id
                }
            });
            if (!enrolledStudent) {
                PaymentResponses.message = "context data not found || user not found";
                return PaymentResponses;
            }
            const emailData = {
                email: enrolledStudent.email,
                title: "Payment Received",
                body: (0, paymentSuc_1.paymentSuccessEmail)(enrolledStudent.firstName, amount / 100, orderId, paymentId)
            };
            yield (0, transporter_1.default)(emailData)
                .then((info) => {
                console.log("Email sent successfully:", info);
            })
                .catch((error) => {
                console.error("Error sending email:", error);
            });
            PaymentResponses.success = true;
            PaymentResponses.message = "Payment email sent successfully";
            return PaymentResponses;
        }
        catch (error) {
            console.log(error);
            PaymentResponses.message = "not able to send payment email";
            return PaymentResponses;
        }
    }),
};
const enrollStudents = (courses, userId) => __awaiter(void 0, void 0, void 0, function* () {
    for (const courseId of courses) {
        try {
            const enrolledCourse = yield db_1.prismaClient.course.update({
                where: {
                    id: courseId,
                },
                data: {
                    sold: { increment: 1 },
                    studentsEnroled: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
            if (!enrolledCourse) {
                PaymentResponses.message = "Course not found";
                return PaymentResponses;
            }
            const courseProgress = yield db_1.prismaClient.courseProgress.create({
                data: {
                    courseName: {
                        connect: {
                            id: courseId,
                        },
                    },
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
            const enrolledStudent = yield db_1.prismaClient.user.update({
                where: {
                    id: userId,
                },
                data: {
                    enrolledCourse: {
                        connect: { id: courseId },
                    },
                    courseProgress: {
                        connect: { id: courseProgress.id },
                    },
                },
            });
            console.log("Enrolled student: ", enrolledStudent);
            const emailData = {
                email: enrolledStudent.email,
                title: "Verification Email",
                body: (0, courseEnrollment_1.courseEnrollmentEmail)(enrolledCourse.courseName, enrolledStudent.firstName), // Replace with the email body content
            };
            yield (0, transporter_1.default)(emailData)
                .then((info) => {
                console.log("Email sent successfully:", info);
            })
                .catch((error) => {
                console.error("Error sending email:", error);
            });
        }
        catch (error) {
            console.log(error);
            PaymentResponses.message = "unable enroled course";
            return PaymentResponses;
        }
    }
});
exports.resolvers = { mutations };
