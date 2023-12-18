export const mutations = `#graphql
createProfile(firstName:String!,lastName:String!,dateOfBirth:String!,about:String!,contactNumber:Int!,gender:String!):ProfileResponse
updateDisplayPicture(displayImageUrl:String):ProfileResponse
deleteAccount:ProfileResponse
`