"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type Profile {
  profileId:ID!     
  gender:String
  dateOfBirth:String
  about:String
  contactNumber:Int
}
type ProfileResponse {
  success:Boolean
  message:String
  profile:Profile
}

type CourseData {
  _id: String
  courseName: String
  courseDescription: String
  totalStudentsEnrolled: Int
  totalAmountGenerated: Int
}
`;
