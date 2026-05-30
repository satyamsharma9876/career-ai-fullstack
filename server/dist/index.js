import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
import cors from 'cors';
import aiRoutes from "./routes/ai.js";
import Razorpay from "razorpay";
import paymentRoutes from "./routes/payment.js";
dotenv.config(); //means .env file k undar jo variables likhe h unko project me load kr do taki proces.env se use kr sake
export const instance = new Razorpay({
    key_id: process.env.Razorpay_key, //TypeScript को process.env की value का type:string | undefined lgta h 
    key_secret: process.env.Razorpay_Secret, //लेकिन Razorpay constructor को चाहिए: string isilye ! lga diye mtlb "मुझे पता है यह value मौजूद है, undefined नहीं होगी।"
});
await connectDB();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // jb frontend/backend se JSON data bhejte h to Express is data ko parse krke req.body me daal deta h 
app.use(express.urlencoded({ extended: true, limit: "10mb" })); //jb frontend/backend se formdata data bhejte h to Express is data ko parse krke req.body me daal deta h 
//extended: true means nested objects allow krta h,eg user[name]=satyam h to ye objbn jayega {user:{name:"satyam"}}
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
});
