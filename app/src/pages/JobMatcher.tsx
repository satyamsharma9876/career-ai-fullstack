
import { useState, useRef } from "react";
import type { Job } from "../types";
import { toBase64 }from "../utils"
import axios from "axios";
import {server} from "../main"
import { Briefcase, Divide, Plus, X } from "lucide-react";
import { Upload } from "lucide-react";
import { AlertCircle, Loader2 } from "lucide-react";



interface Result {
    jobs: Job[];
    summary: string;
}


const JobMatcherPage = () => {
    const [mode, setMode] = useState<"manual" | "resume">("manual")
    const [skills, setSkills] = useState<string[]>([]);
    const[skillInput, setskill] = useState("");
    const[experience, setExp] = useState("");
    const[file, setFile] = useState<File | null>(null);
    const[result, setResult] = useState<Result | null>(null);
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    function addSkill(){
        const s = skillInput.trim();
        if(s && !skills.includes(s)) setSkills((p) => [...p, s]);//here p is purani skills arry & yha skills arry me nayi skill add ho rhi h
        setskill(""); //input box को empty कर देता है।
    }

     function handleFileChange(file: File){
      if(file.type !== "application/pdf")
        return setError("Please upload a pdf file.");
     
     if(file.size > 5 *1024 * 1024)
      return setError("File size should be less than 5MB.")

     setError("");
     setFile(file);
     }
     async function handleSubmit(){
        setError("");
        setResult(null);

        if(mode ==="manual" && (!skills.length || !experience.trim())) {
            return setError("Please add at least one skill and your experience.")
        }
        if(mode ==="resume" && !file){
            return setError("Please upload your resume pdf.");
        }

        setLoading(true);
        try {
            let payload: any = {mode};
            if(mode==="manual"){
                payload = {...payload, skills, experience}
            }else{
                payload = {...payload, pdfBase64: await toBase64(file!)//! means Non-null assertion operator
            }   

            const {data} = await axios.post(`${server}/api/ai/job-Matcher`,payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                setResult(data);
        } 
        }catch (error: any) {   
            setError( error?.response?.data?.message || "failed to fetch job matches" );      
        }
       finally{
        setLoading(false);

     }

 }

   return (
     <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
       <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="glass-card p-1.5 flex gap-1.5">
            {(["manual", "resume"] as const).map((m)=>(
                <button 
                key={m} 
                onClick={()=>{
                setMode(m); 
                setResult(null)
                setError("");
               }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
               duration-200 capitalize ${mode === m ? "btn-primary": "text-white/40 hover:text-white/70"} `}// capitalise: हर word का पहला letter capital कर देना।
            >{m === "manual" ? "Enter skills manually" : "Upload Resume"}
            </button>
            ))}
        </div>

        {mode === "manual" && (
            <div className="glass-card p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/30 uppercase tracking-widest">
                    Your Skills
                    </label>
                    <div className="flex gap-2">
                        <input value={skillInput} onChange={e => setskill(e.target.value)} //skillInput:मतलब input के अंदर जो text दिखेगा वो skillInput state से आएगा
                        onKeyDown={e => e.key=== "Enter" && addSkill()}
                        placeholder="e.g. React, Python, SQL..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm
                         text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
                        />
                        <button 
                        onClick={addSkill} 
                        className="btn-primary px-4 py-2.5 rounded-xl 
                        text-sm flex items-center gap-1.5">
                          <Plus size={14}/>Add
                        </button>
                    </div>
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {skills.map((s) => (
                                <span className="feature-pill gap-2" key={s}>
                                    {s}{" "}
                                    <button
                                    onClick={()=>{//here p is purani skills arry
                                        setSkills((p) => p.filter((x) => x !== s));
                                    }}>
                                    <X size={10}/>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/30 uppercase tracking-widest">
                    Experience & Background
                    </label>
                    <textarea
                    value={experience}
                    onChange={(e)=> setExp(e.target.value)}
                    rows={4}
                    placeholder="e.g. 2 year of frontend development, worked on e-commerce projects, familier with agile teams..."
                    className="bg-white/5  rounded-xl px-4 py-5
                    text-sm text-white placeholder-white/25 outline-none
                    focus: border-indigo-500/50 transition-colors "
                    />
                </div>
            </div>
        )}

        {mode === "resume" && (
         <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if(f) handleFileChange(f);
            }}
            onClick={() => fileRef.current?.click()}
            className="glass-card border-dashed border-white/15 flex flex-col 
            items-center justify-center gap-3 py-10 cursor-pointer hover:border-indigo-500/40
            hover:bg-white/2 transition-all duration-300 group"
            >
            <div 
              className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed 
             border-indigo-500/20 flex items-center justify-center 
              group-hover:scale-105 transition-transform ">
              <Upload size={32} className="text-indigo-400"/>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white/80">
              {result ? "Analyse another Resume" : "Drop your resume here"}
              </p>
              <p className="text-white/35 text-sm mt-0.5">
              or click to browse • PDF only • max 5MB</p>
            </div>
            <input 
             type="file" 
             ref={fileRef} 
             accept=".pdf" 
             className="hidden" 
             onChange={(e)=>{
             const f = e.target.files?.[0];
             if(f) handleFileChange(f)
              e.target.value = "";
             }}     
            /> 
         </div>
        )}
        { error && (
        <p className="text-red-400 text-sm flex items-center gap-1.5">
         <AlertCircle size={14} /> {error}
        </p>
        )}

        {!loading && (
            <button 
            onClick={handleSubmit}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex 
            items-center justify-center gap-2"
            >
            <Briefcase size={16}/>
            Find Matching Jobs
            </button>
        )}

        {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
         <Loader2 size={36} className="text-indigo-400 animate-spin"/>
         <p className="text-white/40 text-sm">Find your best job matches...</p>
        </div>
        )}
       </div>
     </div>
   );

};

export default JobMatcherPage

