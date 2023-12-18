"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
type Payment {
    id:String!    
    userId:String
    coursesId:String  
    transactionID:String
}
type PaymentResponse {
    success: Boolean,
    message: String,
    totalAmount: Int
}
`;
