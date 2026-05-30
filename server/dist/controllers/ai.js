import { GoogleGenAI } from '@google/genai'; //इसमें GoogleGenAI class है जिससे तुम Gemini AI को use कर पाते हो।
import dotenv from 'dotenv';
import TryCatch from '../middlewares/trycatch.js';
import User from '../models/User.js';
import { buildResumePrompt, generateInterviewPrompt, ResumeAnalyserPrompt } from '../config/prompt.js'; //importing prompt jo AI ko instruction dega
import { JobMatcherPrompt } from '../config/prompt.js';
dotenv.config(); //.env file को activate/load करता है।
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMNI }); //Gemini AI client/object बना रहा है,API key देकर authenticate कर रहा है।
// ! ka mtlb hm typescript ko bta rhe h ki "TypeScript trust me, value undefined नहीं होगी"
export const analyseResume = TryCatch(async (req, res) => {
    const { pdfBase64 } = req.body; //f से request body में pdfBase64 आ रहा है,upr AuthenticatedRequest type h req ka mtlb req koi normal req nhi h isme req.user bhi hoga
    if (!pdfBase64) {
        return res.status(400).json({
            message: "PDF data is required",
        });
    }
    const user = await User.findById(req.user?._id); //logged-in user database से find कर रहा है।
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "Upgrade Your plan to continue",
        });
    }
    //  Gemini को request भेजते समय mainly ये structure होता है:
    //   ai.models.generateContent({
    //   model: "...",
    //   contents: [...]  //contents k undr msgs hote h hr msgs me { role: "...", parts: [...] } hota h
    //  })// or parts me actual data jaise text, image, pdf,audio,etc hota h
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", //कौन सा Gemini model use करना है।
        contents: [
            {
                role: "user", //message किसका है,यहाँ user message है।
                parts: [
                    { text: ResumeAnalyserPrompt }, //AI को instruction दे रहा है। eg:Analyze this resume and return JSON...
                    {
                        inlineData: {
                            mimeType: "application/pdf", //file type बता रहे हो कि PDF है। for image: mimeType: "image/png", & data: imageBase64
                            data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
                            //Frontend से base64 अक्सर ऐसे आता है:data:application/pdf;base64,JVBERi0xLjc...
                            //लेकिन Gemini को सिर्फ raw base64 चाहिए:JVBERi0xLjc... to replace() prefix हटा रहा है।
                        },
                    },
                ],
            },
        ],
    });
    //   क्योंकि Gemini एक ही request में multiple things समझ सकता है:
    //   parts: [
    //    { text: "compare this" },
    //    { inlineData: image1 },
    //    { inlineData: image2 }
    //   ]// mtlb in dono images ko compaere kro
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    //AI कभी response ऐसे देता है: to ye line use yese bna deta h 
    //     ```json                            {
    //     {                                     "score": 90
    //      "score":90                        }
    //     }                                     
    //     ```
    if (!rawText) {
        return res.status(500).json({
            message: "Ai returned empty response",
        });
    }
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText); //AI text को actual JSON object में convert कर रहा है। eg: {score:90}
    }
    catch (error) {
        return res.status(500).json({
            message: "Ai returned invalid Json",
            rawResponse: response.text, //it is optional, it is send ताकि frontend में देख सको AI ने actual में क्या भेजा।
        });
    }
    if (!user.hasProAcess()) {
        user.freeRequestsUsed += 1;
        await user.save(); //database में updated value save
    }
    res.json(jsonResponse);
});
export const jobMatcher = TryCatch(async (req, res) => {
    const { mode, skills, experience, pdfBase64 } = req.body;
    if (!mode)
        return res.status(400).json({ message: "Mode is Reuired" });
    if (mode === "manual" && (!skills?.length || !experience?.trim()))
        return res.status(400).json({
            message: "Skills and experience are required"
        });
    if (mode === "resume" && !pdfBase64)
        return res.status(400).json({
            message: "pdfBase64 are required",
        });
    const user = await User.findById(req.user?._id);
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "Upgrade Your plan to continue",
        });
    }
    const parts = [{ text: JobMatcherPrompt(mode, skills, experience) }];
    if (mode === "resume") {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
            }
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
    });
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    if (!rawText) {
        return res.status(500).json({
            message: "Ai returned empty response",
        });
    }
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText);
    }
    catch (error) {
        return res.status(500).json({
            message: "Ai returned invalid Json",
            rawResponse: response.text,
        });
    }
    if (!user.hasProAcess()) {
        user.freeRequestsUsed += 1;
        await user.save();
    }
    res.json(jsonResponse);
});
export const generateInterview = TryCatch(async (req, res) => {
    const { mode, round, skills, experience, pdfBase64 } = req.body;
    if (!mode || !round)
        return res.status(400).json({ message: "Mode and round are Reuired" });
    if (mode === "manual" && (!skills?.length || !experience?.trim()))
        return res.status(400).json({
            message: "Skills and experience are required"
        });
    if (mode === "resume" && !pdfBase64)
        return res.status(400).json({
            message: "pdfBase64 are required",
        });
    const user = await User.findById(req.user?._id);
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "Upgrade Your plan to continue",
        });
    }
    const parts = [
        { text: generateInterviewPrompt(round, mode, skills, experience) },
    ];
    if (mode === "resume") {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
            }
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
    });
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    if (!rawText) {
        return res.status(500).json({
            message: "Ai returned empty response",
        });
    }
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText);
    }
    catch (error) {
        return res.status(500).json({
            message: "Ai returned invalid Json",
            rawResponse: response.text,
        });
    }
    if (!user.hasProAcess()) {
        user.freeRequestsUsed += 1;
        await user.save();
    }
    res.json(jsonResponse);
});
export const buildResume = TryCatch(async (req, res) => {
    const { mode, formData, pdfBase64 } = req.body;
    if (!mode)
        return res.status(400).json({
            message: "Mode is Reuired"
        });
    if (mode === "manual" && !formData)
        return res.status(400).json({
            message: "form data is required"
        });
    if (mode === "improve" && !pdfBase64)
        return res.status(400).json({
            message: "pdfBase64 are required",
        });
    const user = await User.findById(req.user?._id);
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "Upgrade Your plan to continue",
        });
    }
    const parts = [{ text: buildResumePrompt(mode, formData) }]; // any:mtlb arry me kisi bhi type ka data aa skta h eh text,image,string, object,array,function, "TypeScript, type checking मत करो"
    if (mode === "improve") {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
            }
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
    });
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    if (!rawText) {
        return res.status(500).json({
            message: "Ai returned empty response",
        });
    }
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText);
    }
    catch (error) {
        return res.status(500).json({
            message: "Ai returned invalid Json",
            rawResponse: response.text,
        });
    }
    if (!user.hasProAcess()) {
        user.freeRequestsUsed += 1;
        await user.save();
    }
    res.json(jsonResponse);
});
