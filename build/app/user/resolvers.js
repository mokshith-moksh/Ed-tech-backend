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
const redis_1 = require("../../client/redis");
const otp_generator_1 = __importDefault(require("otp-generator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const transporter_1 = __importDefault(require("../../utils/transporter"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailVerification_1 = require("../../mail/templates/emailVerification");
const passwordUpdatedTemp_1 = require("../../mail/templates/passwordUpdatedTemp");
const mutations = {
    sendOtp: (parent, { email }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            var otp;
            const checkUserPresent = yield db_1.prismaClient.user.findUnique({
                where: { email: email }
            });
            if (checkUserPresent) {
                return "User is Already Registered";
            }
            const StoredOtp = yield redis_1.RedisClient.get(`${email}`);
            if (!StoredOtp) {
                otp = otp_generator_1.default.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false
                });
            }
            else {
                return StoredOtp;
            }
            const emailData = {
                email: email,
                title: 'Verification Email',
                body: (0, emailVerification_1.otpTemplate)(otp), // Replace with the email body content
            };
            yield (0, transporter_1.default)(emailData)
                .then((info) => {
                console.log('Email sent successfully:', info);
            })
                .catch((error) => {
                console.error('Error sending email:', error);
            });
            //inserting the unique otp
            yield redis_1.RedisClient.setex(`${email}`, 300, JSON.stringify(otp));
            return otp;
        }
        catch (error) {
            console.log(error);
        }
    }),
    signUp: (parent, { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp }, context) => __awaiter(void 0, void 0, void 0, function* () {
        const response = {
            success: false,
            message: "",
            userDetails: {}
        };
        try {
            if (!firstName || !email || !password || !confirmPassword || !otp) {
                response.message = "Cradentials are required.";
                return response;
            }
            if (password !== confirmPassword) {
                response.message = "Password does not match";
                return response;
            }
            const existingUser = yield db_1.prismaClient.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return response.message = "User already exist.";
            }
            const recivedEmailOTP = yield redis_1.RedisClient.get(`${email}`);
            console.log(recivedEmailOTP);
            const cleanResponse = recivedEmailOTP && recivedEmailOTP.replace(/"/g, '');
            if (otp !== cleanResponse) {
                response.message = "OTP does not match.";
                return response;
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield db_1.prismaClient.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    accountType,
                    active: true,
                    approved: true,
                    profileImageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
                    updated_at: new Date()
                }
            });
            response.success = true;
            response.message = "success";
            return response;
        }
        catch (error) {
            console.log(error);
            return response.message = "error while siging UP";
        }
    }),
    logIn: (parent, { email, password }, context) => __awaiter(void 0, void 0, void 0, function* () {
        const response = {
            success: false,
            message: "",
        };
        try {
            if (!email || !password) {
                response.message = "email || password is required";
                return response;
            }
            const user = yield db_1.prismaClient.user.findUnique({
                where: {
                    email
                }
            });
            if (!user) {
                response.message = "user not found";
                return response;
            }
            if (yield bcrypt_1.default.compare(password, user.password)) {
                const payload = {
                    email: user.email,
                    id: user.id,
                    role: user.accountType
                };
                const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: "24h"
                });
                //seting up the cookie
                if (context.res) {
                    const cookieOptions = {
                        httpOnly: true,
                        maxAge: 24 * 60 * 60 * 1000,
                        // secure: process.env.NODE_ENV === 'production',
                    };
                    context.res.cookie('token', token, cookieOptions);
                    console.log("cookies setup done");
                    console.log(context);
                }
                else {
                    console.error("context.res is undefined");
                }
                response.success = true;
                response.message = "login successfull";
                return response;
            }
            else {
                response.message = "password mismatch form DB";
                return response;
            }
        }
        catch (error) {
            console.log(error);
            response.message = "login failed";
            return response;
        }
    }),
    changePassword: (parent, { oldPassword, newPassword }, context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const response = {
            success: false,
            message: "",
        };
        try {
            const userId = (_a = context.DecodedUser) === null || _a === void 0 ? void 0 : _a.id;
            const userDetails = yield db_1.prismaClient.user.findUnique({ where: { id: userId } });
            if (!userDetails) {
                response.message = "user not found";
                return response;
            }
            const isPasswordMatch = yield bcrypt_1.default.compare(oldPassword, userDetails === null || userDetails === void 0 ? void 0 : userDetails.password);
            if (!isPasswordMatch) {
                response.message = "password mismatch";
                return response;
            }
            const encryptedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            const updatedUserDetails = yield db_1.prismaClient.user.update({
                where: {
                    id: userId,
                },
                data: {
                    password: encryptedPassword
                }
            });
            //sending the mail
            try {
                const emailData = {
                    email: updatedUserDetails.email,
                    title: 'Password for your account has been updated',
                    body: (0, passwordUpdatedTemp_1.passwordUpdated)(updatedUserDetails.email, updatedUserDetails.firstName), // Replace with the email body content
                };
                yield (0, transporter_1.default)(emailData)
                    .then((info) => {
                    console.log('Email sent successfully:', info);
                })
                    .catch((error) => {
                    console.error('Error sending email:', error);
                });
            }
            catch (error) {
                console.log(error);
                response.message = "Error sending email: ";
                return response;
            }
        }
        catch (error) {
            console.log(error);
            response.message = "Error: changePassword  ";
            return response;
        }
    })
};
exports.resolvers = { mutations };
