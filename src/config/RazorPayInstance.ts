import Razorpay from "razorpay"

export const razorpatInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY as string,
    key_secret: process.env.RAZORPAY_SECRET as string,
})