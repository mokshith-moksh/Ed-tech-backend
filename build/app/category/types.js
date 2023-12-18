"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type Category {
  id:ID!          
  name:String
  description:String
  courses:[Course]
}
type CategoryResponse {
  success:Boolean
  message:String
  category:Category
}
type CategoryDetails {
  selectedCategory: Category!
  differentCategory: Category!
  mostSellingCourses: [Course!]
}
`;
