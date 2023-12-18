import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prismaClient } from "../../client/db"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { convertSecondsToDuration } from "../../utils/secToDuration";

const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
});


const CourseResponse ={
    success: false,
    course: {},
    message: ""
  }

const queries = {
    getSignedUrlThumNail:async(parent:any,{thumbNailName,thumbNailType}:{thumbNailName:string,thumbNailType:string},context:any)=>{
        if (!context.isInstructor) throw new Error("Unauthenticated");

    const allowedImageTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(thumbNailType))
      throw new Error("Unsupported Image Type");

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      ContentType: thumbNailType,
      Key: `uploads/${context.DecodedUser.id}/Course/${thumbNailName}-${Date.now()}`,
    });

    const signedURL = await getSignedUrl(s3Client, putObjectCommand);

    return signedURL;

    },
    getAllCourses:async(parent:any,_:any,context:any)=>{
          try {
            const allCourses = await prismaClient.course.findMany({
                where:{
                    status : 'Published'
                },
                include:{
                    instructorName:true,
                    ratingAndReviews:true,
                    studentsEnroled:true
                }
            })
            return allCourses;
          } catch (error) {
            console.error("can't get all courses in getAllCourses resolver", error);
             CourseResponse.message = "can't get all courses in getAllCourses resolver";
              return CourseResponse;
          }
    },
    getCourseDetails:async(parent:any,{courseId}:{courseId:string},context:any)=>{
     try {
        const courseDetails = await prismaClient.course.findUnique({
            where:{
                id:courseId
            },
            include:{
                instructorName:{
                    include:{
                        additionalDetails:true
                    }
                },
                category:true,
                ratingAndReviews:true,
                courseContent:{
                    include:{
                        subSection:true
                    }
                }
            }
        })

        if (!courseDetails) {
           CourseResponse.message = "no course detail is present";
           return CourseResponse;
          }
     
          let totalDurationInSeconds = 0
          courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
              const timeDurationInSeconds = parseInt(subSection.timeDuration)
              totalDurationInSeconds += timeDurationInSeconds
            })
          })
        
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return {
            courseDetails,
            totalDuration
        }

     } catch (error) {
             console.error("can't get all courses in getAllCourses resolver", error);
             CourseResponse.message = "can't get all courses in getCourseDetails resolver";
             return CourseResponse;
     }
    },
    getInstructorCourses:async(parent:any,{courseId}:{courseId:string},context:any)=>{
     try {
     const instructorId = context.DecodedUser.id;

     const instructorCourse = await prismaClient.course.findMany({
        where:{
            id:instructorId
        }
     })
     return instructorCourse
   } catch (error) {
    console.error("An error occurred in getInstructorCourses", error);
    CourseResponse.message = "getInstructorCourses failed to implement"
    return CourseResponse;
   }
    },
    getFullCourseDetails:async(parent:any,{courseId}:{courseId:string},context:any)=>{
      try {
        const courseDetails = await prismaClient.course.findFirst({
            where:{
                id:courseId,
            },
            include:{
                instructorName:{
                    include:{
                        additionalDetails:true
                    }
                },
                category:true,
                ratingAndReviews:true,
                courseContent:{
                    include:{
                        subSection:true
                    }
                }
                
            },
        
        })
        if(!courseDetails){
            CourseResponse.message = "Course not found";
            return CourseResponse;
        }

        let courseProgressCount = await prismaClient.courseProgress.findUnique({
            where:{
                id:courseId,
                userId:context.DecodedUser.id
            },
            include:{
                completedVideos:true
            }
        })

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
              const timeDurationInSeconds = parseInt(subSection.timeDuration)
              totalDurationInSeconds += timeDurationInSeconds
            })
          })
          const totalDuration =  (totalDurationInSeconds)
          return {
            courseDetails,
            totalDuration,
            completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
          }
   } catch (error) {
      console.error("An error occurred in getFullCourseDetails", error);
      CourseResponse.message = "getFullCourseDetails failed to implement"
      return CourseResponse;
   }
    },
}

const mutations = {
    createCourse:async(parent:any,{courseName,courseDescription,whatYouWillLearn,price,tag,categoryId,status,thumbNail}:{courseName:string,courseDescription:string,whatYouWillLearn:string,price:number,tag:string[],categoryId:string,status:string,thumbNail:string},context:any)=>{
          try {
            
            if(!context.IsInstructor){
             CourseResponse.message = "Unauthorized";
             return CourseResponse;  
            }
            if (!status || status === undefined) {
                status = "Draft"
              }
            const newCourse = await prismaClient.course.create({
                data: {
                  courseName,
                  courseDescription,
                  whatYouWillLearn,
                  price,
                  tag,
                  category:{
                    connect:{
                        id:categoryId
                    }
                  },
                  status,
                  instructorName:{
                    connect:{
                        id:context.DecodedUser.id
                    }
                  },
                  thumbnail:thumbNail
                },
              });
              await prismaClient.user.update({
                where:{
                    id:context.DecodedUser.id
                },
                data:{
                    createdcourses:{
                        connect:{
                            id:newCourse.id
                        }
                    }
                }
              })
              await prismaClient.category.update({
                where:{
                    id:categoryId
                },
                data:{
                    courses:{
                        connect:{
                            id:newCourse.id
                        }
                    }
                }
              })
              CourseResponse.message = "new course created successfully";
              CourseResponse.success = true;
              CourseResponse.course = newCourse

              return CourseResponse;
          } catch (error) {
            console.log(error);
            CourseResponse.message = "not able to create course";
            return CourseResponse;
          }
    },
    editCourse:async(parent:any,{courseId,thumbNail}:{courseId:string,thumbNail:string},context:any)=>{
        const course = await prismaClient.course.findUnique({
            where:{
                id:courseId
            }
        })
       
        if(!course){
            CourseResponse.message = "for editing course not found"
            return CourseResponse;
        }

    if(thumbNail){
        await prismaClient.course.update({
            where:{
                id:courseId
            },
            data:{
                thumbnail:thumbNail
            }
        })
    }
    CourseResponse.message = "edit course successfully";
    CourseResponse.success = true;
    CourseResponse.course = course
    return CourseResponse;

    },
    deleteCourse:async(parent:any,{courseId}:{courseId:string})=>{
     try {
        await prismaClient.course.delete({
            where:{
                id:courseId
            }
        })
        CourseResponse.message = "delete course successfully"
        CourseResponse.success = true
        return CourseResponse;
     } catch (error) {
        console.log(error);
        CourseResponse.message = "delete course failed"
        return CourseResponse;
     }
    }
}


export const resolvers = {mutations,queries}