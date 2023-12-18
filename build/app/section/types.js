"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type Section {
  id:ID!          
  sectionId:String    
  sectionName:String
  subSection:[subSection]
}
type SectionResponse {
  success:Boolean
  message:String
  Section:Section
}
`;
