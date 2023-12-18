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
exports.isAdmin = exports.isInstructor = exports.isStudent = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const response = {
        success: false,
        message: "",
    };
    try {
        const token = req.cookies.token || ((_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        console.log(token);
        if (!token) {
            response.message = "no token available";
            return response;
        }
        try {
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            return decode; // Assuming decode is of type DecodedUserType
        }
        catch (error) {
            console.log(error);
            response.message = "not able to perform decode token middleware";
            return response;
        }
    }
    catch (error) {
        console.log(error);
        response.message = "not able to perform auth middleware";
        return response;
    }
});
exports.auth = auth;
const isStudent = (decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const response = {
        success: false,
        message: "",
    };
    try {
        if (isDecodedUserType(decodedUser)) {
            // Now TypeScript knows that 'decodedUser' is of type DecodedUserType
            if (decodedUser.role !== "Student") {
                // Your logic for a student
                return false;
            }
            else if (decodedUser.role === "Student") {
                // Handle the case where 'decodedUser' is of type ErrorResponse
                return true;
            }
        }
    }
    catch (error) {
        // Handle any errors
        console.log(error);
        response.message = "not able to authorize the student";
        return false;
    }
});
exports.isStudent = isStudent;
const isInstructor = (decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const response = {
        success: false,
        message: "",
    };
    try {
        if (isDecodedUserType(decodedUser)) {
            // Now TypeScript knows that 'decodedUser' is of type DecodedUserType
            if (decodedUser.role !== "Instructor") {
                // Your logic for a student
                return false;
            }
            else {
                // Handle the case where 'decodedUser' is of type ErrorResponse
                return true;
            }
        }
    }
    catch (error) {
        // Handle any errors
        console.log(error);
        response.message = "not able to authorize the student";
        return false;
    }
});
exports.isInstructor = isInstructor;
const isAdmin = (decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const response = {
        success: false,
        message: "",
    };
    try {
        if (isDecodedUserType(decodedUser)) {
            // Now TypeScript knows that 'decodedUser' is of type DecodedUserType
            if (decodedUser.role !== "Admin") {
                // Your logic for a student
                return false;
            }
            else {
                // Handle the case where 'decodedUser' is of type ErrorResponse
                return true;
            }
        }
    }
    catch (error) {
        // Handle any errors
        console.log(error);
        response.message = "not able to authorize the student";
        return false;
    }
});
exports.isAdmin = isAdmin;
// Type guard to check if an object is of type DecodedUserType
function isDecodedUserType(obj) {
    return obj && obj.role !== undefined;
}
