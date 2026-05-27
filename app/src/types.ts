export interface User {//यह User नाम का interface बना रहा है।
  _id: string;
  name: string;
  email: string;
  image: string;//User की profile image का URL store होगा।
  subscription: Date | null;// | means OR
  freeRequestsUsed: number;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;//यह check करेगा user authenticated है या नहीं।
  setUser: React.Dispatch<React.SetStateAction<User | null>>;//यह React का state update function है,यह function user state को update करेगा।
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;//यह isAuth state update करेगा।
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  LogoutUser: () => void;//ye fn h, koi parameter nhi leta, kuch return nhi krta
}

export interface Job {
  title: string;
  company: string;
  matchScore: number;//means AI या system कितना match बता रहा है।
  location: string;
  type: string;
  skills: string[];
  whyMatch: string;
  applyTip: string;
}

export interface Question {
  id: number;
  question: string;
  hint: string;
  category: string;
}
export interface InterviewData {
  role: string;
  round: string;
  questions: Question[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}
export interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
  gpa: string;
}
export interface Project {
  name: string;
  description: string;
  link: string;
}
export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: { technical: string[]; soft: string[] };
  projects: Project[];
  certifications: string[];
}

export interface ScoreBlock {
  score: number;
  feedback: string;
}
export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}
export interface Analysis {
  atsScore: number;
  scoreBreakdown: {
    formatting: ScoreBlock;
    keywords: ScoreBlock;
    structure: ScoreBlock;
    readability: ScoreBlock;
  };
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
}
