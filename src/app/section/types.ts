export const types = `#graphql
type Section {
  id:ID!          
  sectionId:String    
  sectionName:String
  subSection:[subSection]
}
type SectionResponse {
  success:Boolean
  message:String
  Section:Section
}
`