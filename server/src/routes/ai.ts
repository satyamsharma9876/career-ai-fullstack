import express from "express"
import { isAuth } from "../middlewares/isAuth.js";
import { analyseResume, jobMatcher } from "../controllers/ai.js";


const router = express.Router();

router.post("/analyse", isAuth, analyseResume);
router.post("/job-Matcher", isAuth, jobMatcher)

export default router;



