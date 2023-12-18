export const mutations = `#graphql
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
