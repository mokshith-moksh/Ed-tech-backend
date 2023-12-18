"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type User {
    id:ID!           
    firstName:String
    lastName:String
    email:String         
    accountType:String       
    active:Boolean           
    approved:Boolean           
    additionalDetails:Profile
    createdcourses:[Course]    
    enrolledCourse:[Course]
    token:String
    profileImageUrl:String      
    RatingAndReview:[RatingAndReview]
    courseProgress:CourseProgress
}
type SignUpResponse {
  success: Boolean
  message: String

}
`;
