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
const courseProgressRes = {
    sucess: false,
    message: "",
    courseProgress: {}
};
const mutations = {
    updateCourseProgress: (parent, { courseId, subSectionId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const subSection = yield db_1.prismaClient.subSection.findUnique({
                where: {
                    id: subSectionId
                }
            });
            if (!subSection) {
                courseProgressRes.message = "Invalid subSection";
                return courseProgressRes;
            }
            let courseProgress = yield db_1.prismaClient.courseProgress.findFirst({
                where: {
                    coursesId: courseId,
                    userId: context.DecodedUser.id
                }
            });
            if (!courseProgress) {
                yield db_1.prismaClient.courseProgress.create({
                    data: {
                        courseName: {
                            connect: {
                                id: courseId
                            }
                        },
                        user: {
                            connect: {
                                id: context.DecodedUser.id
                            }
                        },
                        completedVideosId: [
                            subSectionId
                        ]
                    }
                });
                courseProgressRes.message = "Course progress created successfully ";
                courseProgressRes.sucess = true;
                return courseProgressRes;
            }
            else {
                const foundCourseProgress = yield db_1.prismaClient.courseProgress.findFirst({
                    where: {
                        completedVideosId: {
                            has: subSectionId
                        }
                    }
                });
                if (foundCourseProgress) {
                    courseProgressRes.message = "Subsection already completed";
                    return courseProgressRes;
                }
                const updatedCourseProgress = yield db_1.prismaClient.courseProgress.update({
                    where: {
                        id: courseProgress.id
                    },
                    data: {
                        completedVideosId: {
                            push: subSectionId,
                        },
                    },
                });
                courseProgressRes.message = "Course progress updated";
                courseProgressRes.sucess = true;
                return courseProgressRes;
            }
        }
        catch (error) {
            console.log(error);
            courseProgressRes.message = "updateCourseProgress error";
            return courseProgressRes;
        }
    })
};
exports.resolvers = { mutations };
