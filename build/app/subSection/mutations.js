"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
createSubSection(title:String!,timeDuration:String!,desciption:String!,SectionId:String!,signedURL:String!):subSectionResponse
updateSubSection(subSectionId:String!,title:String,description:String,signedURL:String):subSectionResponse
deleteSubSection(subSectionId:String!):subSectionResponse
`;
