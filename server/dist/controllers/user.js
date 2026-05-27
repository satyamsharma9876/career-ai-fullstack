import TryCatch from "../middlewares/trycatch.js";
import { oauth2client } from "../config/googleconfig.js"; //Google OAuth client import ho rha , yhi google se baat krega
import axios from "axios"; //HTTP requests भेजने के लिए use हो रहा है,इससे Google API call करेंगे।
import User from "../models/User.js";
import jwt from "jsonwebtoken";
export const loginUser = TryCatch(async (req, res) => {
    const { code } = req.body; //forntend jo bhejega use lia ja rha h
    if (!code) {
        return res.status(400).json({
            message: "Authorization code is required",
        });
    }
    const googleRes = await oauth2client.getToken(code); //यह Google को authorization code भेजता है और बदले में tokens लेता है।
    oauth2client.setCredentials(googleRes.tokens); //अब tokens को OAuth client में set कर रहे हो,अब यह client authenticated है 
    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
    //अब Google API को request भेजी जा रही है,Google verify करेगा: token valid है?, user कौन है? or userRes me email, name, picture user ka google bhej deta h
    const { email, name, picture } = userRes.data; //Google से user data मिल चुका है, अब backend decide करेगा ki kya krna h
    let user = await User.findOne({ email }); //checking in mongoDB ki is emailvala user phele se h ya nhi
    if (!user) {
        user = await User.create({
            name,
            email,
            image: picture, //means Google का picture field → आपके DB के image field में save हो रहा है।
        });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
        expiresIn: "15d",
    }); //1st is payload means token k undr user ki id store hogi
    //2nd is secret key Backend इसी से token sign करता है,बाद में verify भी इसी से होता है
    //3rd is options mtlb token 15 days बाद expire हो जाएगा।
    res.json({
        message: "user logged In",
        token, //JWT token भेज रहे हो।
        user, //user data bhi bhej rhe ho
    });
});
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});
//token kyu nikal rhe 
// मान लो user ने Google login कर लिया।
// अब आगे user:
// profile देखेगा
// AI request करेगा
// premium routes access करेगा
// तो backend को कैसे पता चलेगा कि:
// “यह वही logged-in user है?”
// HTTP requests stateless होती हैं।
// हर request अलग होती है।
// Backend automatically याद नहीं रखता कि कौन login है।
//Login के बाद backend user को एक JWT token देता है।
// Frontend इसे save कर लेता है।
// फिर frontednd हर protected request में भेजता है।
// Example:
// Authorization: Bearer eyJhbGciOi...
//full flow of Google Login
// User clicks Google Login
//         ↓
// Google popup opens
//         ↓
// Google returns auth code
//         ↓
// Frontend gets code
//         ↓
// Axios POST to backend
//         ↓
// Backend verifies with Google
//         ↓
// Backend gets user info
//         ↓
// MongoDB save/find user
//         ↓
// JWT token generated
//         ↓
// Frontend stores token
//         ↓
// User logged in
