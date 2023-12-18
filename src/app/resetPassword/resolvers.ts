import { prismaClient } from "../../client/db";
import crypto from "crypto";
import { RedisClient } from "../../client/redis";
import mailSender from "../../utils/transporter";
import bcrypt from "bcrypt";

const mutations = {
  resetPasswordToken: async (
    parent: any,
    { email }: { email: string },
    context: any
  ) => {
    const response = {
      success: false,
      message: "",
    };
    try {
      const userExist = await prismaClient.user.findUnique({
        where: { email: email },
      });
      if (!userExist) {
        response.message = "User does not exist";
        return response;
      }
      const token = crypto.randomBytes(20).toString("hex");

      await RedisClient.setex(
        `RePassToken_${token}_${userExist.id}`,
        300,
        token
      );

      const url = `http:localhost:3000/update-Password/${userExist.id}/${token}`;

      const emailData = {
        email: email, // Replace with the recipient's email address
        title: "Password Reset", // Replace with the email subject
        body: `Your Link for email verification is ${url} . Please click this url to reset your password`, // Replace with the email body content
      };

      await mailSender(emailData)
        .then((info) => {
          console.log("Email sent successfully:", info);
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
      response.success = true;
      response.message = `token sent in email: ${token}`;
      return response;

    } catch (error) {
      console.log(error);
      response.message = "not able to send email for resetpassword";
      return response;
    }
  },
  resetPassword: async (
    parent: any,
    {
      id,
      token,
      password,
      confirmPassword,
    }: { id: string; token: string; password: string; confirmPassword: string },
    context: any
  ) => {
    const response = {
      success: false,
      message: "",
    };
    try {
      if (password !== confirmPassword) {
        response.message = "password and confirm password does not match";
        return response;
      }
      const userToken = await RedisClient.get(`RePassToken_${token}_${id}`);

      if (!userToken) {
        response.message = "token does not exist, resend resetpassword email";
        return response;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUserDetails = await prismaClient.user.update({
        where: {
          id: id,
        },
        data: {
          password: hashedPassword,
        },
      });
      response.success = true;
      response.message = "updated user details with new password"
      return response;
    } catch (error) {
      console.log(error);
      response.message = "not able to validate the genrated token";
    }
  },
};

export const resolvers = {mutations}
