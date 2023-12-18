export const types = `#graphql
type CourseProgress {
  courseId:ID!           
  userId:ID!
  completedVideosId:ID!
  completedVideos:[subSection]
}
type CourseProgressResponse{
  sucess:Boolean
  message:String
  courseProgress:CourseProgress
}
`