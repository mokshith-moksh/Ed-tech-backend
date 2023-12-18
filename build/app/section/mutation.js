"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
createSection(sectionName:String!,courseId:String!):SectionResponse
updateSection(sectionName:String!,sectionId:String!,courseId:String):SectionResponse
deleteSection(sectionId:String!,courseId:String):SectionResponse
`;
