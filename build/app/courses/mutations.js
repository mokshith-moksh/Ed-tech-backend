"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
createCourse(courseName:String!,courseDescription:String!,whatYouWillLearn:String!,price:Int!,tag:[String!]!,categoryId:String!,status:String,thumbNail:String!):CourseResponse
editCourse(courseId:String!,thumbNail:String):CourseResponse
deleteCourse(courseId:String):CourseResponse
`;
