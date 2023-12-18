"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
capturePayment(courses:[String!]!):PaymentResponse
verifyPayment(razorpay_order_id:String!,razorpay_payment_id:String!,razorpay_signature:String!,courses:[String!]!):PaymentResponse
sendPaymentSuccessEmail(orderId:String!,paymentId:String!,amount:Int!):PaymentResponse
`;
