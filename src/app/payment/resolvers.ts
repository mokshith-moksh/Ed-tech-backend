import { response } from "express";
import { prismaClient } from "../../client/db";
import { v4 as uuidv4 } from "uuid";
import { razorpatInstance } from "../../config/RazorPayInstance";
import crypto from "crypto";
import mailSender from "../../utils/transporter";
import { courseEnrollmentEmail } from "../../mail/templates/courseEnrollment";
import { paymentSuccessEmail } from "../../mail/templates/paymentSuc";

const PaymentResponses = {
  success: false,
  course: {},
  message: "",
  totalAmount: 0,
};

const mutations = {
  capturePayment: async (
    parent: any,
    { courses }: { courses: string[] },
    context: any
  ) => {
    try {
      if (courses.length === 0) {
        PaymentResponses.message = "course is empty";
        return response;
      }
      let total_amount = 0;

      for (const course_id of courses) {
        try {
          // Find the course by its ID
          let course = await prismaClient.course.findUnique({
            where: { id: course_id },
          });

          // If the course is not found, return an error
          if (!course) {
            PaymentResponses.message = "course not found";
            return PaymentResponses;
          }

          // Check if the user is already enrolled in the course
          const userDetail = await prismaClient.course.findUnique({
            where: { id: context.DecodedUser.id },
            include: {
              studentsEnroled: true,
            },
          });

          if (!userDetail) {
            PaymentResponses.message = "user not found";
            return PaymentResponses;
          }

          const enrolledStudent = userDetail.studentsEnroled.includes(
            context.DecodedUser.id
          );

          if (enrolledStudent) {
            PaymentResponses.message = "student already enrolled";
            return PaymentResponses;
          }

          // Add the price of the course to the total amount
          total_amount += course.price;
        } catch (error) {
          console.log(error);
        }
      }
      const options = {
        amount: total_amount * 100,
        currency: "INR",
        receipt: uuidv4(),
      };

      try {
        const paymentResponse = await razorpatInstance.orders.create(
          options,
          function (err, order) {
            console.log(order);
            if (err) {
              console.log(err);
            }
          }
        );
        console.log(paymentResponse);
        PaymentResponses.message = "payment response successfully";
        PaymentResponses.success = true;
        return paymentResponse;
      } catch (error) {
        console.log(error);
        PaymentResponses.message = "payment response Unsuccessfully";
        return PaymentResponses;
      }
    } catch (error) {
      console.log(error);
      PaymentResponses.message = "error in createpayment";
      return PaymentResponses;
    }
  },
  verifyPayment: async (
    parent: any,
    {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
    }: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      courses: string[];
    },
    context: any
  ) => {
    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET as string)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await enrollStudents(courses, context.DecodedUser.id);
      PaymentResponses.message = "Payment Verification successful";
      PaymentResponses.success = true;
      return PaymentResponses;
    }
    PaymentResponses.message = "Payment Verification failed";
    return PaymentResponses;
  },
  sendPaymentSuccessEmail: async (
    parent: any,
    { orderId,paymentId,amount }: { orderId:string,paymentId:string,amount:number},
    context: any
  ) => {
       try {
        const enrolledStudent = await prismaClient.user.findUnique({
          where:{
            id:context.DecodedUser.id
          }
        })
        if(!enrolledStudent){
             PaymentResponses.message = "context data not found || user not found";
              return PaymentResponses
        }

        const emailData = {
          email: enrolledStudent.email, // Replace with the recipient's email address
          title: "Payment Received", // Replace with the email subject
          body: paymentSuccessEmail(enrolledStudent.firstName,amount/100,orderId,paymentId)
        };
        await mailSender(emailData)
        .then((info) => {
          console.log("Email sent successfully:", info);
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
        PaymentResponses.success = true;
        PaymentResponses.message = "Payment email sent successfully"
        return PaymentResponses;
       } catch (error) {
        console.log(error);
        PaymentResponses.message = "not able to send payment email"
        return PaymentResponses;
       }
  },
};

const enrollStudents = async (courses: string[], userId: string) => {
  for (const courseId of courses) {
    try {
      const enrolledCourse = await prismaClient.course.update({
        where: {
          id: courseId,
        },
        data: {
          sold:
          {increment:1},
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

      const courseProgress = await prismaClient.courseProgress.create({
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

      const enrolledStudent = await prismaClient.user.update({
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
        email: enrolledStudent.email, // Replace with the recipient's email address
        title: "Verification Email", // Replace with the email subject
        body: courseEnrollmentEmail(enrolledCourse.courseName,enrolledStudent.firstName), // Replace with the email body content
      };

      await mailSender(emailData)
        .then((info) => {
          console.log("Email sent successfully:", info);
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
    } catch (error) {
      console.log(error);
      PaymentResponses.message = "unable enroled course";
      return PaymentResponses;
    }
  }
};

export const resolvers = { mutations };
