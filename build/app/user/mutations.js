"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
sendOtp(email: String!):String
signUp(firstName:String!,
      lastName:String,
      email:String!,
      password:String!,
      confirmPassword:String!,
      accountType:String!,
      contactNumber:String,
      otp:String!):SignUpResponse
logIn(email:String!,password:String!,):SignUpResponse
changePassword(oldPassword:String,newPassword:String):SignUpResponse
`;
