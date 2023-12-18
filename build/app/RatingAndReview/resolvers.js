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
const ratingAndReviewRes = {
    success: false,
    message: "",
    ratingAndReview: {},
};
const queries = {
    getAverageRating: (parent, { courseId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield db_1.prismaClient.ratingAndReview.aggregate({
                where: {
                    courseId: {
                        equals: courseId,
                    },
                },
                _avg: {
                    rating: true,
                },
            });
            const averageRating = result._avg.rating || 0;
            return {
                success: true,
                averageRating,
                message: "Average rating retrieved successfully"
            };
        }
        catch (error) {
            console.error("An error occurred in average rating resolver", error);
            ratingAndReviewRes.message = "An error occurred in rating resolver";
            return ratingAndReviewRes;
        }
    }),
    getAllRatingReview: (parent, _, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const allReviews = yield db_1.prismaClient.ratingAndReview.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profileImageUrl: true,
                        },
                    },
                    course: {
                        select: {
                            id: true,
                            courseName: true,
                        },
                    },
                },
                orderBy: {
                    rating: 'desc',
                },
            });
            return allReviews;
        }
        catch (error) {
            console.error("An error occurred in getAllRatingReview resolver", error);
            ratingAndReviewRes.message = "An error occurred in getAllRatingReview resolver";
            return ratingAndReviewRes;
        }
    }),
};
const mutations = {
    createRating: (parent, { rating, review, courseId, }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const courseDetails = yield db_1.prismaClient.course.findFirst({
                where: {
                    id: courseId,
                    studentsEnroled: {
                        some: {
                            id: context.DecodedUser.id,
                        },
                    },
                },
                include: {
                    ratingAndReviews: true,
                },
            });
            if (!courseDetails) {
                ratingAndReviewRes.message = "student is not enrolled in this course";
                return ratingAndReviewRes;
            }
            const alreadyReviewed = yield db_1.prismaClient.ratingAndReview.findFirst({
                where: {
                    userId: context.DecodedUser.id,
                    courseId,
                },
            });
            if (alreadyReviewed) {
                ratingAndReviewRes.message = "student is already reviewed";
                return ratingAndReviewRes;
            }
            const ratingAndreview = yield db_1.prismaClient.ratingAndReview.create({
                data: {
                    user: {
                        connect: {
                            id: context.DecodedUser.id,
                        },
                    },
                    course: {
                        connect: {
                            id: courseId,
                        },
                    },
                    rating,
                    review,
                },
            });
            ratingAndReviewRes.message = "review created successfully";
            ratingAndReviewRes.success = true;
            return ratingAndReviewRes;
        }
        catch (error) {
            console.log(error);
            ratingAndReviewRes.message = "not able create the rating and review";
            return ratingAndReviewRes;
        }
    })
};
exports.resolvers = { mutations, queries };
