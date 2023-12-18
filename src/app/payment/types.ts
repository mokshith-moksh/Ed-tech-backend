export const types = `#graphql
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
`