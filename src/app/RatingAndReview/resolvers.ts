import { prismaClient } from "../../client/db";

const ratingAndReviewRes = {
  success: false,
  message: "",
  ratingAndReview: {},
};

const queries = {
  getAverageRating: async (
    parent: any,
    { courseId }: { courseId: string },
    context: any
  ) => {
    try {
      const result = await prismaClient.ratingAndReview.aggregate({
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
        success:true,
        averageRating,
        message:"Average rating retrieved successfully"
      }

    } catch (error) {
       console.error("An error occurred in average rating resolver", error);
       ratingAndReviewRes.message = "An error occurred in rating resolver";
       return ratingAndReviewRes;
    }
  },
  getAllRatingReview: async (parent: any, _: any, context: any) => {
    try {
      const allReviews = await prismaClient.ratingAndReview.findMany({
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
    } catch (error) {
      console.error("An error occurred in getAllRatingReview resolver", error);
      ratingAndReviewRes.message = "An error occurred in getAllRatingReview resolver";
      return ratingAndReviewRes;
      
    }
  },
}
const mutations = {
  createRating: async (
    parent: any,
    {
      rating,
      review,
      courseId,
    }: { rating: number; review: string; courseId: string },
    context: any
  ) => {
    try {
      const courseDetails = await prismaClient.course.findFirst({
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
      const alreadyReviewed = await prismaClient.ratingAndReview.findFirst({
        where: {
          userId: context.DecodedUser.id,
          courseId,
        },
      });

      if (alreadyReviewed) {
        ratingAndReviewRes.message = "student is already reviewed";
        return ratingAndReviewRes;
      }

      const ratingAndreview = await prismaClient.ratingAndReview.create({
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
    } catch (error) {
      console.log(error);
      ratingAndReviewRes.message = "not able create the rating and review";
      return ratingAndReviewRes;
    }
  }

};

export const resolvers = { mutations,queries};
