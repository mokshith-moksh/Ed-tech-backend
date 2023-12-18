"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queries = void 0;
exports.queries = `#graphql
getSignedUrlThumNail(thumbNailName: String!,thumbNailType: String!):String
getAllCourses:[Course]
getCourseDetails(courseId:String!):courseDetails
getInstructorCourses:[Course]
getFullCourseDetails:courseDetails
`;
