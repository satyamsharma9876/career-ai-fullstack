import express from "express"
import { isAuth } from "../middlewares/isAuth.js";
import { analyseResume } from "../controllers/ai.js";


const router = express.Router();

router.post("/analyse", isAuth, analyseResume);


export default router;



