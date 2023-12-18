export const types = `#graphql
type subSection {
  subsectionId:ID!                
  title:String
  timeDuration:String
  description:String
  videoUrl:String
}
type subSectionResponse{
    success:Boolean
    message:String
    subSections:subSection
}
`