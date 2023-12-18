export const types = `#graphql
type Course {
  id:ID!          
  instructorId:String
  instructorName:User             
  courseName:String
  courseDescription:String
  whatYouWillLearn:String
  courseContent:[Section]
  ratingAndReviews:[RatingAndReview]
  price:Int
  thumbnail:String
  tag:[String]
  category:[Category]
  studentsEnroled:[User]
  status:String
}
type CourseResponse {
  success: Boolean!
  course: Course
  message: String
}
type courseDetails{
  courseDetails:[Course]
  totalDuration:Int,
  completedVideos:[subSection]
}
`