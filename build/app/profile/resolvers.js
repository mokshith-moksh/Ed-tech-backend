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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../client/db");
const secToDuration_1 = require("../../utils/secToDuration");
const profileResponse = {
    success: false,
    message: "",
    profile: {}
};
var Gender;
(function (Gender) {
    Gender["Boy"] = "Boy";
    Gender["Girl"] = "Girl";
    Gender["Other"] = "Other";
    Gender["null"] = "null";
})(Gender || (Gender = {}));
const queries = {
    getAllUserDetails: (parent, _, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = context.DecodedUser.id;
            const userDetails = yield db_1.prismaClient.user.findUnique({
                where: {
                    id: id,
                }
            });
            return userDetails;
        }
        catch (error) {
            console.error("failed to get getAllUserDetails resolver", error);
            profileResponse.message = "failed getAllUserDetails resolver";
            return profileResponse;
        }
    }),
    getEnrolledCourses: (parent, _, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = context.DecodedUser.id;
            let userDetails = yield db_1.prismaClient.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    enrolledCourse: {
                        include: {
                            courseContent: {
                                include: {
                                    subSection: true
                                }
                            }
                        }
                    }
                }
            });
            if (!userDetails) {
                profileResponse.message = "No user details";
                return profileResponse;
            }
            const updatedEnrolledCourses = userDetails.enrolledCourse.map((course) => __awaiter(void 0, void 0, void 0, function* () {
                let totalDurationInSeconds = 0;
                let SubsectionLength = 0;
                for (const content of course.courseContent) {
                    totalDurationInSeconds += content.subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0);
                    SubsectionLength += content.subSection.length;
                }
                const courseProgressCount = yield db_1.prismaClient.courseProgress.findFirst({
                    where: {
                        id: course.id,
                        userId: userId,
                    },
                });
                const completedVideosCount = (courseProgressCount === null || courseProgressCount === void 0 ? void 0 : courseProgressCount.completedVideosId.length) || 0;
                const progressPercentage = SubsectionLength === 0
                    ? 100
                    : Math.round((completedVideosCount / SubsectionLength) * 100 * Math.pow(10, 2)) / Math.pow(10, 2);
                return Object.assign(Object.assign({}, course), { totalDuration: (0, secToDuration_1.convertSecondsToDuration)(totalDurationInSeconds), progressPercentage });
            }));
            return updatedEnrolledCourses;
        }
        catch (error) {
            console.error("failed to get getEnrolledCourses resolver", error);
            profileResponse.message = "failed getEnrolledCourses resolver";
            return profileResponse;
        }
    }),
    instructorDashboard: (parent, _, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const courseDetails = yield db_1.prismaClient.course.findMany({
                where: {
                    instructorId: context.DecodedUser.id,
                },
                include: {
                    studentsEnroled: true,
                },
            });
            if (!courseDetails) {
                profileResponse.message = "no courses found";
                return profileResponse;
            }
            const courseData = courseDetails.map((course) => {
                const totalStudentsEnrolled = course.studentsEnroled.length;
                const totalAmountGenerated = totalStudentsEnrolled * course.price;
                // Create a new object with the additional fields
                return {
                    _id: course.id,
                    courseName: course.courseName,
                    courseDescription: course.courseDescription,
                    // Include other course properties as needed
                    totalStudentsEnrolled,
                    totalAmountGenerated,
                };
            });
            return courseData;
        }
        catch (error) {
            console.error("An error occurred", error);
            profileResponse.message = "An error occurred";
            return profileResponse;
        }
    })
};
const mutations = {
    createProfile: (parent, { firstName, lastName, dateOfBirth, about, contactNumber, gender }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.prismaClient.profile.create({
                data: {
                    profileuser: {
                        connect: {
                            id: context.DecodedUser.id
                        }
                    },
                    gender,
                    dateOfBirth,
                    about,
                    contactNumber
                }
            });
            profileResponse.message = "profile created succesfully";
            profileResponse.success = true;
            return profileResponse;
        }
        catch (error) {
            console.log(error);
            profileResponse.message = "error while creating profile";
            return profileResponse;
        }
    }),
    updateDisplayPicture: (parent, { displayImageUrl }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.prismaClient.user.update({
                where: {
                    id: context.DecodedUser.id
                },
                data: {
                    profileImageUrl: displayImageUrl
                }
            });
            profileResponse.message = "profile updated succesfully";
            profileResponse.success = true;
            return profileResponse;
        }
        catch (error) {
            console.error("Error while updatingdisplayPicture", error);
            profileResponse.message = "error while updating displayPicture";
            return profileResponse;
        }
    }),
    deleteAccount: (parent, _, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedUser = yield db_1.prismaClient.user.delete({
                where: {
                    id: context.DecodedUser.id
                }
            });
            console.log(deletedUser);
            profileResponse.message = "deleted user successfully";
            profileResponse.success = true;
            return profileResponse;
        }
        catch (error) {
            console.error("Error while deleteAccount", error);
            profileResponse.message = "error while deleteAccount account";
            return profileResponse;
        }
    })
};
exports.resolvers = { mutations, queries };
