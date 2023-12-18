"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type subSection {
  subsectionId:ID!                
  title:String
  timeDuration:String
  description:String
  videoUrl:String
}
type subSectionResponse{
    success:Boolean
    message:String
    subSections:subSection
}
`;
