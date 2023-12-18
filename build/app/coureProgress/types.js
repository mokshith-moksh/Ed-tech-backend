"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type CourseProgress {
  courseId:ID!           
  userId:ID!
  completedVideosId:ID!
  completedVideos:[subSection]
}
type CourseProgressResponse{
  sucess:Boolean
  message:String
  courseProgress:CourseProgress
}
`;
