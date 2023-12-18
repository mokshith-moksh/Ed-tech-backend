export const mutations = `#graphql
capturePayment(courses:[String!]!):PaymentResponse
verifyPayment(razorpay_order_id:String!,razorpay_payment_id:String!,razorpay_signature:String!,courses:[String!]!):PaymentResponse
sendPaymentSuccessEmail(orderId:String!,paymentId:String!,amount:Int!):PaymentResponse
`