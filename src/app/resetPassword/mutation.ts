export const mutations = `#graphql
  resetPasswordToken(email: String!): ResetPasswordResponse
  resetPassword(id:String!,token: String!,password:String!,confirmPassword:String!): ResetPasswordResponse
`