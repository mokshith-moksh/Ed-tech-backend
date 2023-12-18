export const queries = `#graphql
getSignedUrlThumNail(thumbNailName: String!,thumbNailType: String!):String
getAllCourses:[Course]
getCourseDetails(courseId:String!):courseDetails
getInstructorCourses:[Course]
getFullCourseDetails:courseDetails
`