import express from "express"
import { isAuth } from "../middlewares/isAuth.js";
import { analyseResume, buildResume, generateInterview, jobMatcher } from "../controllers/ai.js";


const router = express.Router();

router.post("/analyse", isAuth, analyseResume);
router.post("/job-Matcher", isAuth, jobMatcher);
router.post("/Interview", isAuth, generateInterview)
router.post("/resume-build",isAuth, buildResume)

export default router;

