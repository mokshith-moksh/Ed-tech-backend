import { prismaClient } from "../../client/db"

const categoryResponse = {
    success: false,
    message:"",
    category:{}
}

const queries ={
  showAllCategories:async(parent:any,_:any,context:any) => {
   try {
    const allCategories = await prismaClient.category.findMany()
    return {
      allCategories
    }
   } catch (error) {
    console.error("Error while fetching all categories:", error);
    categoryResponse.message = "error while fetching all category";
    return categoryResponse;
   }
  },
  categoryPageDetails:async(parent:any,{categoryId}:{categoryId:string},context:any) => {
       try {
        const selectedCategory = await prismaClient.category.findUnique({
          where:{
            id: categoryId
          },
          include:{
            courses:{
              where:{
                status:"Published"
              },
              include:{
                courseProgress:true
              }
            }
          }
        })
        if(!selectedCategory){
          categoryResponse.message = "No category selected";
          return categoryResponse
        }

        if(selectedCategory.courses.length === 0){
          categoryResponse.message = "No courses found in selected category";
          return categoryResponse
        }

        const categoriesExceptSelected = await prismaClient.category.findMany({
          where: { id: { not: categoryId } },
        });

        const differentCategory = await prismaClient.category.findUnique({
          where: {
            id: categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)].id,
          },
          include: {
            courses: {
              where: { status: "Published" },
            },
          },
        });
       
        //top selling courses, most selling courses 
        const allCategories = await prismaClient.category.findMany({
          include: {
            courses: {
              where: { status: "Published" },
            },
          },
        });
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 10);
        
        return {
          selectedCategory,
          differentCategory,
          mostSellingCourses
        }
        
       } catch (error) {
         categoryResponse.message = "error while crating categoryPageDetails";
         return categoryResponse;
       }
  },

}
const mutations = {
    createCategory:async(parent:any,{name,description}:{name:string,description:string},context:any) =>{
          try {
            const CategoryDeatils = await prismaClient.category.create({
                data:{
                    name,
                    description
                }
            });
            categoryResponse.message = "Category added successfully"
            return categoryResponse;
          } catch (error) {
            console.log(error);
            categoryResponse.message = "unable create Category"
            return categoryResponse;
          }
    }
}

function getRandomInt(max:number) {
  return Math.floor(Math.random() * max)
}

export const resolvers = {mutations,queries}