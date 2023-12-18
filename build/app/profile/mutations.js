"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
createProfile(firstName:String!,lastName:String!,dateOfBirth:String!,about:String!,contactNumber:Int!,gender:String!):ProfileResponse
updateDisplayPicture(displayImageUrl:String):ProfileResponse
deleteAccount:ProfileResponse
`;
