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
const client_s3_1 = require("@aws-sdk/client-s3");
const db_1 = require("../../client/db");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const secToDuration_1 = require("../../utils/secToDuration");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_DEFAULT_REGION,
});
const CourseResponse = {
    success: false,
    course: {},
    message: ""
};
const queries = {
    getSignedUrlThumNail: (parent, { thumbNailName, thumbNailType }, context) => __awaiter(void 0, void 0, void 0, function* () {
        if (!context.isInstructor)
            throw new Error("Unauthenticated");
        const allowedImageTypes = [
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/webp",
        ];
        if (!allowedImageTypes.includes(thumbNailType))
            throw new Error("Unsupported Image Type");
        const putObjectCommand = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            ContentType: thumbNailType,
            Key: `uploads/${context.DecodedUser.id}/Course/${thumbNailName}-${Date.now()}`,
        });
        const signedURL = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommand);
        return signedURL;
    }),
    getAllCourses: (parent, _, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const allCourses = yield db_1.prismaClient.course.findMany({
                where: {
                    status: 'Published'
                },
                include: {
                    instructorName: true,
                    ratingAndReviews: true,
                    studentsEnroled: true
                }
            });
            return allCourses;
        }
        catch (error) {
            console.error("can't get all courses in getAllCourses resolver", error);
            CourseResponse.message = "can't get all courses in getAllCourses resolver";
            return CourseResponse;
        }
    }),
    getCourseDetails: (parent, { courseId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const courseDetails = yield db_1.prismaClient.course.findUnique({
                where: {
                    id: courseId
                },
                include: {
                    instructorName: {
                        include: {
                            additionalDetails: true
                        }
                    },
                    category: true,
                    ratingAndReviews: true,
                    courseContent: {
                        include: {
                            subSection: true
                        }
                    }
                }
            });
            if (!courseDetails) {
                CourseResponse.message = "no course detail is present";
                return CourseResponse;
            }
            let totalDurationInSeconds = 0;
            courseDetails.courseContent.forEach((content) => {
                content.subSection.forEach((subSection) => {
                    const timeDurationInSeconds = parseInt(subSection.timeDuration);
                    totalDurationInSeconds += timeDurationInSeconds;
                });
            });
            const totalDuration = (0, secToDuration_1.convertSecondsToDuration)(totalDurationInSeconds);
            return {
                courseDetails,
                totalDuration
            };
        }
        catch (error) {
            console.error("can't get all courses in getAllCourses resolver", error);
            CourseResponse.message = "can't get all courses in getCourseDetails resolver";
            return CourseResponse;
        }
    }),
    getInstructorCourses: (parent, { courseId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const instructorId = context.DecodedUser.id;
            const instructorCourse = yield db_1.prismaClient.course.findMany({
                where: {
                    id: instructorId
                }
            });
            return instructorCourse;
        }
        catch (error) {
            console.error("An error occurred in getInstructorCourses", error);
            CourseResponse.message = "getInstructorCourses failed to implement";
            return CourseResponse;
        }
    }),
    getFullCourseDetails: (parent, { courseId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const courseDetails = yield db_1.prismaClient.course.findFirst({
                where: {
                    id: courseId,
                },
                include: {
                    instructorName: {
                        include: {
                            additionalDetails: true
                        }
                    },
                    category: true,
                    ratingAndReviews: true,
                    courseContent: {
                        include: {
                            subSection: true
                        }
                    }
                },
            });
            if (!courseDetails) {
                CourseResponse.message = "Course not found";
                return CourseResponse;
            }
            let courseProgressCount = yield db_1.prismaClient.courseProgress.findUnique({
                where: {
                    id: courseId,
                    userId: context.DecodedUser.id
                },
                include: {
                    completedVideos: true
                }
            });
            let totalDurationInSeconds = 0;
            courseDetails.courseContent.forEach((content) => {
                content.subSection.forEach((subSection) => {
                    const timeDurationInSeconds = parseInt(subSection.timeDuration);
                    totalDurationInSeconds += timeDurationInSeconds;
                });
            });
            const totalDuration = (totalDurationInSeconds);
            return {
                courseDetails,
                totalDuration,
                completedVideos: (courseProgressCount === null || courseProgressCount === void 0 ? void 0 : courseProgressCount.completedVideos)
                    ? courseProgressCount === null || courseProgressCount === void 0 ? void 0 : courseProgressCount.completedVideos
                    : [],
            };
        }
        catch (error) {
            console.error("An error occurred in getFullCourseDetails", error);
            CourseResponse.message = "getFullCourseDetails failed to implement";
            return CourseResponse;
        }
    }),
};
const mutations = {
    createCourse: (parent, { courseName, courseDescription, whatYouWillLearn, price, tag, categoryId, status, thumbNail }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!context.IsInstructor) {
                CourseResponse.message = "Unauthorized";
                return CourseResponse;
            }
            if (!status || status === undefined) {
                status = "Draft";
            }
            const newCourse = yield db_1.prismaClient.course.create({
                data: {
                    courseName,
                    courseDescription,
                    whatYouWillLearn,
                    price,
                    tag,
                    category: {
                        connect: {
                            id: categoryId
                        }
                    },
                    status,
                    instructorName: {
                        connect: {
                            id: context.DecodedUser.id
                        }
                    },
                    thumbnail: thumbNail
                },
            });
            yield db_1.prismaClient.user.update({
                where: {
                    id: context.DecodedUser.id
                },
                data: {
                    createdcourses: {
                        connect: {
                            id: newCourse.id
                        }
                    }
                }
            });
            yield db_1.prismaClient.category.update({
                where: {
                    id: categoryId
                },
                data: {
                    courses: {
                        connect: {
                            id: newCourse.id
                        }
                    }
                }
            });
            CourseResponse.message = "new course created successfully";
            CourseResponse.success = true;
            CourseResponse.course = newCourse;
            return CourseResponse;
        }
        catch (error) {
            console.log(error);
            CourseResponse.message = "not able to create course";
            return CourseResponse;
        }
    }),
    editCourse: (parent, { courseId, thumbNail }, context) => __awaiter(void 0, void 0, void 0, function* () {
        const course = yield db_1.prismaClient.course.findUnique({
            where: {
                id: courseId
            }
        });
        if (!course) {
            CourseResponse.message = "for editing course not found";
            return CourseResponse;
        }
        if (thumbNail) {
            yield db_1.prismaClient.course.update({
                where: {
                    id: courseId
                },
                data: {
                    thumbnail: thumbNail
                }
            });
        }
        CourseResponse.message = "edit course successfully";
        CourseResponse.success = true;
        CourseResponse.course = course;
        return CourseResponse;
    }),
    deleteCourse: (parent, { courseId }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.prismaClient.course.delete({
                where: {
                    id: courseId
                }
            });
            CourseResponse.message = "delete course successfully";
            CourseResponse.success = true;
            return CourseResponse;
        }
        catch (error) {
            console.log(error);
            CourseResponse.message = "delete course failed";
            return CourseResponse;
        }
    })
};
exports.resolvers = { mutations, queries };
