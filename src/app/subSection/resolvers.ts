import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prismaClient } from "../../client/db";

const response = {
    sucess:false,
    message:"",
    subSections:{}
} 
const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
});

const queries = {
    getSignedURLForVideos:async(parent:any,{videoName,videoType}:{videoName:string,videoType:string},context:any)=>{
        if(!context.IsInstructor){
            throw new Error("Unauthorized access to videoupload alert send to admin...")
        }
        const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

        if (!allowedVideoTypes.includes(videoType)){
            throw new Error("Unsupported Video Type")
        }
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            ContentType: videoType,
            Key: `uploads/${context.DecodedUser.id}/videos/${videoName}-${Date.now()}`,
          });
        
        const signedURL = await getSignedUrl(s3Client, putObjectCommand);
       
        return signedURL;

    }
}

const mutations = {

    createSubSection:async(parent:any,{title,timeDuration,desciption,SectionId,signedURL}:{title:string,timeDuration:string,desciption:string,SectionId:string,signedURL:string},context:any)=>{
     try {
        if(!title||!timeDuration||!desciption||!SectionId){
           response.message = "all credentials required";
           return response;
        }
        console.log("creating new section")
       const uploadedVideos = await prismaClient.subSection.create({
        data:{
            subsection:{
                connect:{
                    id:SectionId
                }
            },
            title,
            timeDuration,
            description:desciption,
            videoUrl:signedURL,
            
        }
       })
       response.message = "uploaded Done!!!"
       response.sucess = true;
       response.subSections = uploadedVideos;
       return response;
     } catch (error) {
        console.log(error);
        response.message = "not uploaded"
        return response;
     } 
    },
    updateSubSection:async(parent:any,{subSectionId,title,description,signedURL,timeDuration}:{subSectionId:string,title:string,description:string,signedURL:string,timeDuration:string},context:any)=>{
       try {
        const subSection = await prismaClient.subSection.findUnique({where:{id:subSectionId}});
        if(!subSection){
          response.message = "subSection Id is wrong || subSection is not found";
          return response;
        }
        if (title !== undefined) {
          subSection.title = title;
        }
  
        if (description !== undefined) {
          subSection.description = description;
        }
  
  
        if (timeDuration !== undefined && signedURL!== undefined) {
          subSection.timeDuration = timeDuration;
          subSection.videoUrl = signedURL
        }
  
        const updatedSubSection = await prismaClient.subSection.update({
          where: { id: subSectionId },
          data: subSection,
        });
  
        response.message = "subSection updated successfully";
        response.sucess = true;
        response.subSections = updatedSubSection;
  
        return response;
       } catch (error) {
        console.error("Error updating subsection", error);
        response.message = "Error updating subsection";
        return response;
       }

    },
    deleteSubSection:async(parent:any,{subSectionId}:{subSectionId:string},context:any)=>{
       try {
        const deletedSubSection = await prismaClient.subSection.delete({
            where:{
                id: subSectionId
            }
        })

        response.message = "deleted successfully";
        response.sucess = true;
        response.subSections = deletedSubSection;

        return response;
       } catch (error) {
        console.error("Error deleteSubSection", error);
        response.message = "Error deleteSubSection";
        return response;
       }
    }
}

export const resolvers = {mutations,queries};