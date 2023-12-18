import { prismaClient } from "../../client/db";
const response = {
            sucess:false,
            message:"",
            Section:{}
        } 
const mutations = {  
    createSection:async(parent:any,{sectionName,courseId}:{sectionName:string,courseId:string},context:any) => {
        
        try {
            if(!sectionName || !courseId){
                response.message = "Sectionname and courseId are required"
                return response;
            }
            const newSection = await prismaClient.section.create({
                data:{
                    sectionName:sectionName,
                    course:{
                        connect:{
                            id:courseId
                        }
                    }
                }
            })
            response.sucess = true;
            response.message = "section updated successfully";
            
            return response;
           } catch (error) {
            console.log(error);
            response.message = "sectionName updating problem"
            return response;
           }
    },
    updateSection:async(parent:any,{sectionName,sectionId}:{sectionName:string,sectionId:string,courseId:string},context:any)=>{
        try {
            const section = await prismaClient.section.update({
                where:{
                    id:sectionId
                },
                data:{
                    sectionName:sectionName
                }
            })
            response.message = "section updated successfully"
            response.sucess = true;
            response.Section = section;
            return response;
        } catch (error) {
            console.log(error);
            response.message = "sectionName updating problem"
            return response;
        }
    },
    deleteSection:async(parent:any,{sectionId,courseId}:{sectionId:string,courseId:string},context:any)=>{
        try {

        await prismaClient.section.delete({
            where:{
                id:sectionId
            }
        })
        response.message = "section deleted"
        response.sucess = true
        return response;
            
        } catch (error) {
            console.log(error);
            response.message = "Error while deleting"
            return response;
        }
    }
}

export const resolvers = {mutations}
