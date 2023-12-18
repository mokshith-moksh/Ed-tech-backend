import { ApolloServer } from "@apollo/server";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import cors from "cors";
import { User } from "./user";
import { Courses } from "./courses";
import { Section } from "./section";
import { subSection } from "./subSection";
import { CourseProgress } from "./coureProgress";
import { Category } from "./category";
import { Profile } from "./profile";
import { RatingAndReviews } from "./RatingAndReview";
import { ResetPassword } from "./resetPassword";
import {auth, isAdmin, isInstructor, isStudent} from "../middleware/auth"
import cookieParser from "cookie-parser"
import { Payment } from "./payment";

export async function initServer() {
  const app = express();
  const graphqlServer = new ApolloServer({
    typeDefs: `
     ${User.types}
     ${Courses.types}
     ${Section.types}
     ${subSection.types}
     ${CourseProgress.types}
     ${Category.types}
     ${Profile.types}
     ${RatingAndReviews.types}
     ${ResetPassword.types}
     ${Payment.types}
    
      type Query{
      ${User.queries}
      ${subSection.queries}
      ${Courses.queries}
      ${Category.queries}
      ${Profile.queries}
      ${RatingAndReviews.queries}
      }
      type Mutation{
        ${User.mutations}
        ${ResetPassword.mutations}
        ${Section.mutations}
        ${Courses.mutations}
        ${Payment.mutations}
        ${Category.mutations}
        ${Profile.mutations}
        ${subSection.mutations}
        ${CourseProgress.mutations}
        ${RatingAndReviews.mutations}
      }
    `,
    resolvers: {
      Query: {
        ...subSection.resolvers.queries,
        ...Courses.resolvers.queries,
        ...Category.resolvers.queries,
        ...Profile.resolvers.queries,
        ...RatingAndReviews.resolvers.queries
      },
      Mutation: {
        ...User.resolvers.mutations,
        ...ResetPassword.resolvers.mutations,
        ...Section.resolvers.mutations,
        ...Courses.resolvers.mutations,
        ...Payment.resolvers.mutations,
        ...Category.resolvers.mutations,
        ...Profile.resolvers.mutations,
        ...subSection.resolvers.mutations,
        ...CourseProgress.resolvers.mutations,
        ...RatingAndReviews.resolvers.mutations
        
      },

      //extraresolver
    },
  });
  
  await graphqlServer.start();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req,res }) => {
       
       const decodedUser = await auth(req);
       const isStudentAuth = await isStudent(decodedUser);
       const isInstructorAuth = await isInstructor(decodedUser);
       const isAdminAuth = await isAdmin(decodedUser);

        return {
          DecodedUser: decodedUser,
          IsStudent: isStudentAuth,
          IsInstructor:isInstructorAuth,
          IsAdminAuth:isAdminAuth,
          res
        }
      },
    })
  );

  return app;
}
