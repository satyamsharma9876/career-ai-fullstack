
import {google} from 'googleapis';//ye Google की official library है जिससे हम Google APIs use करते हैं,google.auth.OAuth2 इसी library के अंदर होता है।

import dotenv from "dotenv";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const oauth2client = new google.auth.OAuth2(//oauth2client google token verify,Access token lene,user info nikallne me kaam ata h
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "postmessage"//frontend direclty backend ko authorization code/token bhej dega, browser redirect jarurui nhi h
);//actually जब frontend से Google Login होता है, तब Google एक code/token देता है।

