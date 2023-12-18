"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../client/db");
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../../client/redis");
const transporter_1 = __importDefault(require("../../utils/transporter"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mutations = {
    resetPasswordToken: (parent, { email }, context) => __awaiter(void 0, void 0, void 0, function* () {
        const response = {
            success: false,
            message: "",
        };
        try {
            const userExist = yield db_1.prismaClient.user.findUnique({
                where: { email: email },
            });
            if (!userExist) {
                response.message = "User does not exist";
                return response;
            }
            const token = crypto_1.default.randomBytes(20).toString("hex");
            yield redis_1.RedisClient.setex(`RePassToken_${token}_${userExist.id}`, 300, token);
            const url = `http:localhost:3000/update-Password/${userExist.id}/${token}`;
            const emailData = {
                email: email,
                title: "Password Reset",
                body: `Your Link for email verification is ${url} . Please click this url to reset your password`, // Replace with the email body content
            };
            yield (0, transporter_1.default)(emailData)
                .then((info) => {
                console.log("Email sent successfully:", info);
            })
                .catch((error) => {
                console.error("Error sending email:", error);
            });
            response.success = true;
            response.message = `token sent in email: ${token}`;
            return response;
        }
        catch (error) {
            console.log(error);
            response.message = "not able to send email for resetpassword";
            return response;
        }
    }),
    resetPassword: (parent, { id, token, password, confirmPassword, }, context) => __awaiter(void 0, void 0, void 0, function* () {
        const response = {
            success: false,
            message: "",
        };
        try {
            if (password !== confirmPassword) {
                response.message = "password and confirm password does not match";
                return response;
            }
            const userToken = yield redis_1.RedisClient.get(`RePassToken_${token}_${id}`);
            if (!userToken) {
                response.message = "token does not exist, resend resetpassword email";
                return response;
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const updatedUserDetails = yield db_1.prismaClient.user.update({
                where: {
                    id: id,
                },
                data: {
                    password: hashedPassword,
                },
            });
            response.success = true;
            response.message = "updated user details with new password";
            return response;
        }
        catch (error) {
            console.log(error);
            response.message = "not able to validate the genrated token";
        }
    }),
};
exports.resolvers = { mutations };
