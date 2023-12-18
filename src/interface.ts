import { Response } from "express";

export interface DecodedUser {
    email: string;
    id: string;
    role: 'Student' | 'Instructor' | 'Admin';
    iat: number;
    exp: number;
  }
  
  export interface GraphQlcontext {
    DecodedUser: DecodedUser;
    IsStudent: boolean;
    IsInstructor: boolean;
    IsAdminAuth: boolean;
    res: Response;
  }

  