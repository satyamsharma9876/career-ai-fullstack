import mongoose, {Document, Schema} from "mongoose";

// mongoose → MongoDB library
// Schema → database structure बनाने के लिए
// Document → Mongoose document type

export interface IUser extends Document {//ye Iuser naam ka interface h, typescript me interface ka mtlb hota h Object kaisa dikhega
    name: string;//uska blueprint,mtlb agr IUser type ka obj banega to unme kon kon si properties hongi or unka datatype kya kya hoga yeh batana
    email:string;//IUser obj me email naam ki prop hogi or uski val string hogi
    image:string;
    subscription: Date | null;//ye user ka expiry date store krega but gr user premium nhi to null store hoga
    freeRequestsUsed: number;//यह count करेगा कि user ने कितनी free requests use कीं।

    hasProAcess():boolean;//yeh custom methods हैं जो बाद में user object पर available होंगे
    canMakeRequest(): boolean;
}

const schema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image:{
        type: String,
        required: true,
    },

    subscription: {
        type: Date,
        default:null,//means नया user by default premium नहीं होगा।
    },

    freeRequestsUsed: {type: Number, default: 0},//हर नए user की free request count शुरू होगी 0 se

  },
 { timestamps: true }
);

schema.methods.hasProAcess = function (): boolean {
    return !!this.subscription && new Date() < new Date(this.subscription);// && ke baad vala chech kr rha h ki current date subscription expiry से छोटी है या नहीं
}//!! ka mtlb value ko true/false me convert krna

schema.methods.canMakeRequest = function (): boolean {//check krega ki user request कर सकता है या नहीं
    return this.hasProAcess() || this.freeRequestsUsed < 3;
}


const User = mongoose.model<IUser>("User", schema)//ye mngoose model mna rha h,ab User.find(),User.create(),User.findOne() kr skte h


export default User;

