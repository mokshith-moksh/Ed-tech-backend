import { prismaClient } from "../../client/db"
import { RedisClient } from "../../client/redis"
import otpGenerator from 'otp-generator'
import bcrypt from "bcrypt"
import { AccountType, Gender } from "@prisma/client"
import mailSender from "../../utils/transporter"
import jwt from "jsonwebtoken"
import {otpTemplate} from "../../mail/templates/emailVerification"
import { passwordUpdated } from "../../mail/templates/passwordUpdatedTemp"


const mutations = {
    sendOtp:async (
        parent: any,
        { email }: { email: string },
        context: any
      )=>{
       try {
        var otp;
        const checkUserPresent = await prismaClient.user.findUnique({
            where:{email:email}
        })
        if(checkUserPresent){
            return "User is Already Registered"
        } 
        
        const StoredOtp = await RedisClient.get(`${email}`);

        if(!StoredOtp){
             otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            })
        }else{
            return StoredOtp;
        }

        const emailData = {
            email: email, // Replace with the recipient's email address
            title: 'Verification Email', // Replace with the email subject
            body: otpTemplate(otp), // Replace with the email body content
          };
       
        await mailSender(emailData)
          .then((info) => {
            console.log('Email sent successfully:', info);
          })
          .catch((error) => {
            console.error('Error sending email:', error);
          });

        //inserting the unique otp
        await RedisClient.setex(`${email}`,300,JSON.stringify(otp));
    
        return otp ;
        
       } catch (error) {
         console.log(error);
       }
      },
    signUp:async( parent: any,
        {
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          accountType,
          contactNumber,
          otp
        }: {
          firstName: string,
          lastName: string,
          email: string,
          password: string,
          confirmPassword: string,
          accountType: AccountType,
          contactNumber: string,
          otp: string
        },
        context: any)=>{
        const response = {
                success: false,
                message: "",
                userDetails:{}
        };

       try {
        if(!firstName||!email||!password||!confirmPassword||!otp){
             response.message = "Cradentials are required.";
            return response
        }
        if(password!==confirmPassword){
             response.message = "Password does not match";
             return response
        }

        const existingUser = await prismaClient.user.findUnique({
            where:{email}
        });
        if(existingUser){
            return response.message = "User already exist.";
        }

        const recivedEmailOTP:string|null = await RedisClient.get(`${email}`);
        console.log(recivedEmailOTP)
        const cleanResponse :string|null = recivedEmailOTP && recivedEmailOTP.replace(/"/g, '');

        if(otp!==cleanResponse){
             response.message = "OTP does not match.";
             return response;
        }
        
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prismaClient.user.create({
            data:{
                firstName,
                lastName,
                email,
                password:hashedPassword,
                accountType,
                active:true,
                approved:true,
                profileImageUrl:`https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
                updated_at: new Date()
            }
        })
        response.success = true;
        response.message = "success";
        
        return response;

       } catch (error) {
        console.log(error);
         return response.message = "error while siging UP";
       }

    },
    logIn:async(parent:any,{email,password}:{email:string,password:string},context:any)=>{
        const response = {
            success: false,
            message: "",
    };
        try {
            if(!email||!password){
                  response.message="email || password is required"
                  return response
            }
            const user = await prismaClient.user.findUnique({
                where:{
                    email
                }
            })
            if(!user){
                 response.message = "user not found";
                 return response;
            }

            if(await bcrypt.compare(password,user.password)){
                const payload = {
                    email:user.email,
                    id:user.id,
                    role:user.accountType
                }
                const token = jwt.sign(payload,process.env.JWT_SECRET as string,{
                    expiresIn:"24h"
                })
                
               //seting up the cookie
             
               if (context.res) {
                const cookieOptions = {
                  httpOnly: true,
                  maxAge: 24 * 60 * 60 * 1000,
                
                  // secure: process.env.NODE_ENV === 'production',
                };
                
                context.res.cookie('token', token, cookieOptions);
                console.log("cookies setup done")
                console.log(context)
              } else {
                console.error("context.res is undefined");
              }
              response.success = true;
              response.message = "login successfull"
              return response

            }else{
                response.message = "password mismatch form DB"
                return response;
            }
           

        } catch (error) {
            console.log(error);
             response.message = "login failed";
             return  response;
        }
    },
    changePassword:async(parent:any,{oldPassword,newPassword}:{oldPassword:string,newPassword:string},context:any)=>{
        const response = {
            success: false,
            message: "",
    }
        try {
            const userId = context.DecodedUser?.id;
            const userDetails = await prismaClient.user.findUnique({where:{id:userId}})
            if(!userDetails){
              response.message = "user not found";
              return response
            }
            const isPasswordMatch = await bcrypt.compare(oldPassword,userDetails?.password);
            if(!isPasswordMatch){
                response.message = "password mismatch";
                return response;
            }
            const encryptedPassword = await bcrypt.hash(newPassword,10);
            const updatedUserDetails = await prismaClient.user.update({
                where:{
                     id: userId,
                },
                data:{
                     password: encryptedPassword
                }
            })
            //sending the mail
            try {
                const emailData = {
                    email: updatedUserDetails.email, // Replace with the recipient's email address
                    title: 'Password for your account has been updated', // Replace with the email subject
                    body: passwordUpdated(updatedUserDetails.email,updatedUserDetails.firstName), // Replace with the email body content
                  };
                  await mailSender(emailData)
                  .then((info) => {
                    console.log('Email sent successfully:', info);
                  })
                  .catch((error) => {
                    console.error('Error sending email:', error);
                  });
            } catch (error) {
                console.log(error)
                response.message = "Error sending email: " ;
                return response;
            }
        } catch (error) {
            console.log(error)
            response.message = "Error: changePassword  " ;
            return response;
        }
    }
    
}
export const resolvers = {mutations}