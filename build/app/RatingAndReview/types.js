"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type RatingAndReview {
  id:ID!
  user:User  
  rating:String
  review:String
  course:Course 
}
type RatingAndReviewResponse {
  sucess:Boolean
  message:String
  ratingAndReview:RatingAndReview
}
type AverageRatingResponse {
  success: Boolean!
  averageRating: Float!
  message: String
}
`;
