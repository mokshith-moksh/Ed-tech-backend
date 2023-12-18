export const mutations = `#graphql
createSubSection(title:String!,timeDuration:String!,desciption:String!,SectionId:String!,signedURL:String!):subSectionResponse
updateSubSection(subSectionId:String!,title:String,description:String,signedURL:String):subSectionResponse
deleteSubSection(subSectionId:String!):subSectionResponse
`