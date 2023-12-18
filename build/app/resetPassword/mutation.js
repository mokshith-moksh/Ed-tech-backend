"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
  resetPasswordToken(email: String!): ResetPasswordResponse
  resetPassword(id:String!,token: String!,password:String!,confirmPassword:String!): ResetPasswordResponse
`;
