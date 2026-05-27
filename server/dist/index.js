import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
import cors from 'cors';
import aiRoutes from "./routes/ai.js";
dotenv.config(); //means .env file k undar jo variables likhe h unko project me load kr do taki proces.env se use kr sake
await connectDB();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // jb frontend/backend se JSON data bhejte h to Express is data ko parse krke req.body me daal deta h 
app.use(express.urlencoded({ extended: true, limit: "10mb" })); //jb frontend/backend se formdata data bhejte h to Express is data ko parse krke req.body me daal deta h 
//extended: true means nested objects allow krta h,eg user[name]=satyam h to ye objbn jayega {user:{name:"satyam"}}
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
});
