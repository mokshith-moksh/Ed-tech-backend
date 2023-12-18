import { prismaClient } from "../../client/db"

const courseProgressRes = {
    sucess:false,
    message:"",
    courseProgress:{}
}
const mutations = {
    updateCourseProgress:async(parent:any,{courseId,subSectionId}:{courseId:string,subSectionId:string},context:any)=>{
      try {
        const subSection = await prismaClient.subSection.findUnique({
            where:{
               id:subSectionId
            }
        });
        if(!subSection){
             courseProgressRes.message = "Invalid subSection";
             return courseProgressRes
        }

        let courseProgress = await prismaClient.courseProgress.findFirst({
            where:{
                coursesId:courseId,
                userId:context.DecodedUser.id
            }
        })
        if(!courseProgress){
             await prismaClient.courseProgress.create({
              data:{
                courseName:{
                  connect:{
                    id:courseId
                  }
                },
                user:{
                  connect:{
                    id:context.DecodedUser.id
                  }
                },
               completedVideosId:[
                subSectionId
               ]
               
              }
             })

         courseProgressRes.message = "Course progress created successfully "
         courseProgressRes.sucess = true;
         return courseProgressRes;
    
        }else{
            const foundCourseProgress = await prismaClient.courseProgress.findFirst({
                where: {
                  completedVideosId: {
                    has: subSectionId
                  }
                }
              });
              if(foundCourseProgress){
                courseProgressRes.message = "Subsection already completed"
                return courseProgressRes
              }
           
              const updatedCourseProgress = await prismaClient.courseProgress.update({
                where: {
                  id:courseProgress.id
                },
                data: {
                  completedVideosId: {
                    push: subSectionId,
                  },
                },
              });

              courseProgressRes.message = "Course progress updated"
              courseProgressRes.sucess = true;

              return courseProgressRes;
              
        }

      } catch (error) {
        console.log(error);
        courseProgressRes.message ="updateCourseProgress error"
        return courseProgressRes;
      }
    }
}

export const resolvers = {mutations}