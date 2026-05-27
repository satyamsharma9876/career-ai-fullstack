import {Request, Response, NextFunction} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";//jwt → token verify करने के लिए,JwtPayload → decoded token का type
import User, { IUser } from "../models/User.js"//User → DB query के लिए,  IUser → TypeScript type


export interface AuthenticatedRequest extends Request {
    user?: IUser | null;//means ab request object me req.user naam ki propery add ho skti h
}//b/c normally Express k req me req.user nhi hota to typescript error deta h isilye custum interface banaya

export const isAuth = async(
    req:AuthenticatedRequest,
    res:Response,
    next: NextFunction
): Promise<void> => {//यह async function है जो कुछ return नहीं करेगा।
    try {
        const authHeader = req.headers.authorization;//authHeader header store hoga jo frontend bhejega

        if(!authHeader || !authHeader.startsWith("Bearer ")) {//checking happening:header hai ki nhi, Bearer se suru ho rha h ki nhi
            res.status(401).json({
                message: "Please Login - no auth header",
            });

            return;
        }
        
        //agr header h i.e Bearer abc123 to split means ["Bearer", "abc123"]
        const token = authHeader.split(" ")[1];//then take 1st index value
        if(!token){
            res.status(401).json({
                message:"Please Login - Token missing",
            });
            return;
        }

        const decodedData = jwt.verify(//token verify hoga same secret key se
            token, 
            process.env.JWT_SEC as string
        ) as JwtPayload;

        if(!decodedData || !decodedData._id){//if token me id nhi h to invalid token
            res.status(401).json({
                message:"Invalid Token",
            });
            return;
        }

        const user = await User.findById(decodedData._id);
        if(!user){
            res.status(401).json({
                message:"expired token",//technically user not found
            });

            return;
        }

        req.user = user;//अब request में logged-in user attach कर दिया। now req.user se user mil jayega

        next()//“Authentication successful, अब आगे जाओ”

    } catch (error: any){
        console.log(error.messaage);
        
        res.status(500).json({
            message: "Please Login",
        })
    }
}

