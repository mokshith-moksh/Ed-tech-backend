import { prismaClient } from "../../client/db";
import { convertSecondsToDuration } from "../../utils/secToDuration";
const profileResponse ={
    success:false,
    message:"",
    profile:{}
}
enum Gender {
    Boy = 'Boy',
    Girl = 'Girl',
    Other = 'Other',
    null = 'null', // or use null instead of Undefined if you prefer
  }

const queries = {
  getAllUserDetails:async(parent:any,_:any,context:any)=>{
    try {
      const id = context.DecodedUser.id
      const userDetails = await prismaClient.user.findUnique({
        where:{
          id:id,
        }
      })
      return userDetails;
    } catch (error) {
      console.error("failed to get getAllUserDetails resolver",error);
      profileResponse.message = "failed getAllUserDetails resolver"
      return profileResponse;
    }
  },
  getEnrolledCourses:async(parent:any,_:any,context:any)=>{
     try {
      const userId = context.DecodedUser.id;
      let userDetails = await prismaClient.user.findUnique({
        where:{
          id:userId,
        },
        include:{
          enrolledCourse:{
            include:{
              courseContent:{
                include:{
                  subSection:true
                }
              }
            }
          }
        }
      });
      if (!userDetails) {
       profileResponse.message = "No user details"
       return profileResponse;
      }
    
      const updatedEnrolledCourses = userDetails.enrolledCourse.map(async (course) => {
        let totalDurationInSeconds = 0;
        let SubsectionLength = 0;
  
        for (const content of course.courseContent) {
          totalDurationInSeconds += content.subSection.reduce(
            (acc, curr) => acc + parseInt(curr.timeDuration),
            0
          );
  
          SubsectionLength += content.subSection.length;
        }
  
        const courseProgressCount = await prismaClient.courseProgress.findFirst({
          where: {
            id: course.id,
            userId: userId,
          },
        });
  
        const completedVideosCount = courseProgressCount?.completedVideosId.length || 0;
  
        const progressPercentage = SubsectionLength === 0
          ? 100
          : Math.round((completedVideosCount / SubsectionLength) * 100 * Math.pow(10, 2)) / Math.pow(10, 2);
  

          return {
            ...course,
            totalDuration: convertSecondsToDuration(totalDurationInSeconds),
            progressPercentage,
          };
        });

        return updatedEnrolledCourses

     } catch (error) {
      console.error("failed to get getEnrolledCourses resolver",error);
      profileResponse.message = "failed getEnrolledCourses resolver"
      return profileResponse;
     }
  },
  instructorDashboard:async(parent:any,_:any,context:any)=>{
   try {
    const courseDetails = await prismaClient.course.findMany({
      where: {
        instructorId: context.DecodedUser.id,
      },
      include: {
        studentsEnroled: true,
      },
    });
    if(!courseDetails){
      profileResponse.message = "no courses found"
      return profileResponse
    }
    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;
  
      // Create a new object with the additional fields
      return {
        _id: course.id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      };
    });
 
    return courseData;
  
   } catch (error) {
    console.error("An error occurred", error);
    profileResponse.message = "An error occurred"
    return profileResponse;
   }
  }
}

const mutations = {
    createProfile:async(parent:any,{firstName,lastName,dateOfBirth,about,contactNumber,gender}:{firstName:string,lastName:string,dateOfBirth:string,about:string,contactNumber:number,gender:Gender},context:any)=>{
      try {
        await prismaClient.profile.create({
           data:{
            profileuser:{
                connect:{
                    id:context.DecodedUser.id
                }
            },
            gender,
            dateOfBirth,
            about,
            contactNumber
           }
        })
        profileResponse.message = "profile created succesfully"
        profileResponse.success = true
        return profileResponse;
      } catch (error) {
        console.log(error);
        profileResponse.message = "error while creating profile"
        return profileResponse;
      }
    },
    updateDisplayPicture:async(parent:any, {displayImageUrl}:{displayImageUrl:string},context:any)=>{
          try {
            await prismaClient.user.update({
              where:{
                id:context.DecodedUser.id
              },
              data:{
                profileImageUrl:displayImageUrl
              }
            })

            profileResponse.message = "profile updated succesfully"
            profileResponse.success = true
            return profileResponse;
          } catch (error) {
            console.error("Error while updatingdisplayPicture", error);
            profileResponse.message = "error while updating displayPicture"
            return profileResponse;
          }
    },
    deleteAccount:async(parent:any, _:any,context:any)=>{
       try {
          const deletedUser = await prismaClient.user.delete({
            where:{
              id:context.DecodedUser.id
            }
          })
          console.log(deletedUser)
          profileResponse.message = "deleted user successfully";
          profileResponse.success = true;
          return profileResponse;
       } catch (error) {
        console.error("Error while deleteAccount", error);
        profileResponse.message = "error while deleteAccount account"
        return profileResponse;
       }
    }
}


export const resolvers = {mutations,queries}