import { Request, response } from "express";
import jwt from "jsonwebtoken";

interface DecodedUserType {
  email: string;
  id: string;
  role: string;
}
interface ErrorResponse {
  success: Boolean;
  message: string;
}

export const auth = async (
  req: Request
): Promise<DecodedUserType | ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    message: "",
  };

  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    console.log(token);
    if (!token) {
      response.message = "no token available";
      return response;
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET as string);
      console.log(decode);
      return decode as DecodedUserType; // Assuming decode is of type DecodedUserType
    } catch (error) {
      console.log(error);
      response.message = "not able to perform decode token middleware";
      return response;
    }
  } catch (error) {
    console.log(error);
    response.message = "not able to perform auth middleware";
    return response;
  }
};

export const isStudent = async (
  decodedUser: DecodedUserType | ErrorResponse
) => {
  const response: ErrorResponse = {
    success: false,
    message: "",
  };
  try {
    if (isDecodedUserType(decodedUser)) {
      // Now TypeScript knows that 'decodedUser' is of type DecodedUserType
      if (decodedUser.role !== "Student") {
        // Your logic for a student
        return false;
      } else if (decodedUser.role === "Student") {
        // Handle the case where 'decodedUser' is of type ErrorResponse
        return true;
      }
    }
  } catch (error) {
    // Handle any errors
    console.log(error);
    response.message = "not able to authorize the student";
    return false;
  }
};

export const isInstructor = async (
  decodedUser: DecodedUserType | ErrorResponse
) => {
  const response: ErrorResponse = {
    success: false,
    message: "",
  };
  try {
    if (isDecodedUserType(decodedUser)) {
      // Now TypeScript knows that 'decodedUser' is of type DecodedUserType
      if (decodedUser.role !== "Instructor") {
        // Your logic for a student
        return false;
      }else {
      // Handle the case where 'decodedUser' is of type ErrorResponse
      return true;
    } 
    }
  } catch (error) {
    // Handle any errors
    console.log(error);
    response.message = "not able to authorize the student";
    return false;
  }
};

export const isAdmin = async (decodedUser: DecodedUserType | ErrorResponse) => {
  const response: ErrorResponse = {
    success: false,
    message: "",
  };
  try {
    if (isDecodedUserType(decodedUser)) {
      // Now TypeScript knows that 'decodedUser' is of type DecodedUserType
      if (decodedUser.role !== "Admin") {
        // Your logic for a student
        return false;
      }else {
      // Handle the case where 'decodedUser' is of type ErrorResponse
      return true;
    }
    } 
  } catch (error) {
    // Handle any errors
    console.log(error);
    response.message = "not able to authorize the student";
    return false;
  }
};

// Type guard to check if an object is of type DecodedUserType
function isDecodedUserType(obj: any): obj is DecodedUserType {
  return obj && obj.role !== undefined;
}
