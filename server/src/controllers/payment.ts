import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import User from "../models/User.js";
import { instance } from "../index.js";
import crypto from 'crypto'


export const checkOut = TryCatch(async(req:AuthenticatedRequest, res) => {// iska kaam Order Create करना
    const user_id = req.user?._id;

    if(!user_id){
        return res.status(400).json({
            message: "No User Id",
        });
    }

    const user = await User.findById(user_id)

    const subTime = user?.subscription ?   //if user.subscription = "2026-06-30T10:00:00.000Z" the by new Date(user.subscription) Mon Jun 30 2026 ... ban jayega
    new Date(user.subscription).getTime(): 0;   // .getTime() date ko milliseconds me badal deta hai

    const now = Date.now();// ye current time देता है milliseconds में।
    const isSubscribed = subTime > now;
    if(isSubscribed){
        return res.status(400).json({
            message: "User already subscribed",
        })
    }

    const {duration} = req.body;

    let amount;
    if(duration === 1){
        amount = Number(299 * 100);// Razorpay amount को paise में लेता है, rupees में नहीं।
    }else{
        amount = (1499 * 100);
    }

    const options = {//अब Razorpay को order बनाने के लिए data दे रहे हैं।
        amount ,//it is shorthand syntax of amount: amount
        currency: "INR", // mtlb Indian Rupees
        notes: {//notes extra information store करने के लिए होते हैं,User को नहीं दिखते,बाद में webhook/payment verification में काम आते हैं।
            user_id: user_id?.toString(),// if user_id = 687654321 then "687654321" hojayega
            duration: duration.toString(),
        },
    };

    const order = await instance.orders.create(options);//यह Razorpay API को request भेजता है,Razorpay order id banata h or order बनाकर वापस देता है।
// g: {                                  order = {
//   "id": "order_Q123abc",                 id: "order_Q123abc",
//   "amount": 29900,                       amount: 29900,
//   "currency": "INR"                      currency: "INR",
//  }                                      status: "created"
//                                        }

    res.status(201).json({
        order,
    });
});

export const paymentVerification = TryCatch(async (req:AuthenticatedRequest, res) => {//Payment verify करने वाला controller
    const user = req.user;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;//Signature Body बनाना eg: "order_123|pay_456"
    
    //most imp for security purpose, Backend अपनी secret key से signature generate करता है।
    const expectedSignature = crypto // crypto Node.js का built-in module है ye security vale kaam krta h like hashing, encryption,signatures
        .createHmac( "sha256", process.env.Razorpay_secret as string)//HMAC = Hash-based Message Authentication Code यह एक secret key लेकर signature बनाता है।
        .update(body)    //means: इस data पर hash लगाओ & sha256:ek hashing algorithm है,यह data को fixed length hash में बदल देता है। eg:hello->2cf24dba5fb0...
        .digest("hex"); //अब final signature निकालो। eg: e7f6d9a1bc23f5...
    
    const isAuthentic = expectedSignature === razorpay_signature;

    if(isAuthentic){// means payment is genuine, ab yhi se subscription activate hogi
        const order = await instance.orders.fetch(razorpay_order_id);//Razorpay से order details वापस लाते हैं। 

// eg:       {
//               "notes":{
//                  "user_id":"123",
//                  "duration":"1"
//             }
//           }

        const duration = Number(order.notes?.duration);

        const now = new Date()// taking current date eg 30 May 2026

        let expiryDate;
        if(duration === 1){
            expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }else{
            expiryDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
        }

        const updateduser = await User.findByIdAndUpdate(
            user?._id,
            { subscription: expiryDate},
            { new: true}
         );

        res.json({
            message: "subscription Purchased Successfully",
            updateduser,
        });
    }else{
        return res.status(400).json({
            message: "Payment Failed",
        })
    }
})

// full flow
// User Pays
//     ↓
// Frontend gets:
// order_id
// payment_id
// signature
//     ↓
// Backend receives them
//     ↓
// Backend creates its own signature
//     ↓
// Compare signatures
//     ↓
// Match?
//  ├─ Yes
//  │    ↓
//  │ Fetch Order
//  │ Get Duration
//  │ Calculate Expiry
//  │ Update User
//  │ Subscription Active
//  │
//  └─ No
//       ↓
//    Payment Failed