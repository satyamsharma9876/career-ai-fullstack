import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true,
    },
    subscription: {
        type: Date,
        default: null, //means नया user by default premium नहीं होगा।
    },
    freeRequestsUsed: { type: Number, default: 0 }, //हर नए user की free request count शुरू होगी 0 se
}, { timestamps: true });
schema.methods.hasProAcess = function () {
    return !!this.subscription && new Date() < new Date(this.subscription); // && ke baad vala chech kr rha h ki current date subscription expiry से छोटी है या नहीं
}; //!! ka mtlb value ko true/false me convert krna
schema.methods.canMakeRequest = function () {
    return this.hasProAcess() || this.freeRequestsUsed < 3;
};
const User = mongoose.model("User", schema); //ye mngoose model mna rha h,ab User.find(),User.create(),User.findOne() kr skte h
export default User;
