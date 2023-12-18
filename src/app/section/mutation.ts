export const mutations = `#graphql
createSection(sectionName:String!,courseId:String!):SectionResponse
updateSection(sectionName:String!,sectionId:String!,courseId:String):SectionResponse
deleteSection(sectionId:String!,courseId:String):SectionResponse
`