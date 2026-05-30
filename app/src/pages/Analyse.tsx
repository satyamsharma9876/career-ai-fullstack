
import { useRef, useState } from "react";
import type { Analysis } from "../types";
import { downloadReport, prioColor, scoreBar, toBase64 } from "../utils";
import axios from "axios"
import {server} from "../main"
import { AlertCircle, CheckCircle2, Loader2, Upload,ChevronRight,Download } from "lucide-react";
import { ScoreRing } from "../ring";
import { scoreColor, prioBg } from "../utils";

const AnalysePage = () => {
    const [result , setResult] = useState<Analysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("");

    const fileRef =useRef<HTMLInputElement>(null)//useRef किसी DOM element को direct access करने के लिए use होता है, HTMLInputElement: यह ref एक HTML input element को point करेगा।
    //why null:Initially i/p मौजूद नहीं होता render होने से पहले isiliye null dia Initially input मौजूद नहीं होता render होने से पहले, and input me fileRef.current us i/p ko rep krega
    // and fileRef.current?.click(): file input को programmatically click कर दो।
    async function handleFile(file: File){//this fn handling browser's uploaded file
      if(file.type !== "application/pdf")
        return setError("Please upload a pdf file.");
     
     if(file.size > 5 *1024 * 1024)
      return setError("File size should be less than 5MB.")

     setError("")
     setLoading(true)
     setResult(null)
//       axios.post( kaha bhejna h , kya bhejna h, extra settings )
//       axios.post(url, payload, config)  
//       axios.get(url, config)//isme body nhi hoti
//       axios.put(url, payload, config)//पूरी object replace/update.
//       axios.patch(url, payload, config)// for small updates
//       axios.delete(url, config)// delete me usually body nhi bhejte

     try {// what is base64: Binary file को text format में convert करना।
        const pdfBase64 = await toBase64(file) //JSON में direct file नहीं भेज सकते easily
        const { data } = await axios.post(`${server}/api/ai/analyse`, //It is backend api end point or Backend API call, req bhej rhe ho b ko
          //axios hme response bhjeta h or us res me se hm data destructure kr lete h
          //const response = {
          //    data: ...,    // backend response
          //    status: 200,
          //    headers: ...,
          //    config: ...,
          // }
          { pdfBase64 }, {
          headers:{Authorization: `Bearer ${localStorage.getItem("token")}`},//JWT token भेज रहे हो authentication के लिए।
        });

        setResult(data);
      } catch (error: any) {
        setError(error?.response?.data?.message || "Analysis Failed. Please try again")
     }finally{
      setLoading(false);
     }
    }
     
    //React.DragEvent:TypeScript को बता रहे हो कि: "ये drag-drop वाला event object होगा"
    const onDrop = (error: React.DragEvent) => {//error:it is not error,it can be e also
      error.preventDefault();//Browser का default behavior रोक रहे हो।
      const f = error.dataTransfer.files[0];//error.dataTransfer:drag/drop से related data रखता है। .files:drop की गई files की list देता है। [0]:पहली file निकाल रहा है।
      if(f) handleFile(f);
    };
    
  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div
        onDrop={onDrop}//jb user file drag krke is div pr chodta h (drop krta h) to onDrop fn chelga
        onDragOver={(e)=> e.preventDefault()}//Normally browser drag-drop allow नहीं करता ye iska def behaviour h,अगर preventDefault() नहीं लगाओगे तो drop event काम नहीं करेगा।
        onClick={() => fileRef.current?.click()}//जब user div पर click करेगा → hidden input automatically click हो जाएगा।
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
          {
            error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </p>
          )}

           <input 
           type="file" //ये file upload input है।
           ref={fileRef} //इस input को fileRef से connect कर दिया, ab fileRef.current से इस input को access कर सकते हो
           accept=".pdf" //सिर्फ PDF files allow होंगी।
           className="hidden" //i/p screen pe nhi dikai dega b/c actual UI div se bana rhe h but asli file picker hidden i/p h
           onChange={(e)=>{
            const f = e.target.files?.[0];//e.target.files: selected files की list,
            if(f) handleFile(f)
              e.target.value = "";//अगर user same file दोबारा upload करे तो normally onChange trigger नहीं होता so yha input reset rhe h
           }}     
           /> 

           {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={36} className="text-indigo-400 animate-spin"/>
              <p className="text-white/40 text-sm">Analysing your resume...</p>
            </div>
            )}

            {result && !loading && (
              <>
              <div className="glass-card p-6 flex items-center gap-6 flex-wrap">{/*flex-wrap:जगह कम पड़े तो next line में चले जाओ। */}
                <div className="relative flex items-center justify-center">{/*relative: ताकि अंदर वाला absolute element इसी div के हिसाब से position हो सके div parent के ऊपर आ sake then */}
                  <ScoreRing score={result.atsScore}/>                              {/*items-center justify-center ki vjah se parent div ke undr aagya absolute vala*/}
                   <div className="absolute flex flex-col items-center "> {/*parent (relative) के ऊपर freely position होगा।*/}
                    <span className={`text-2xl font-black 
                      ${scoreColor(result.atsScore)}`}>
                        {result.atsScore}
                    </span>
                    <span className="text-[10px] text-white/30">ATS</span>
                   </div>
                </div>
                <div className="flex-1 min-w-0"> {/*flex-1:available horizontal space का जितना हिस्सा बचा है वो मैं ले लूँ",min-w-0:text properly wrap होता है, overflow कम होता है,shrink allow krta h*/}
                  <p className="font-semibold mb-1">Overall Score</p>
                  <p className="text-white/45 text-sm leading-relaxed">
                  {result.summary}
                  </p>
                </div>
                
                <div className="glass-card p-6 flex flex-col gap-4">
                  <p className="text-xs text-white/30 uppercase tracking-widest">
                  Score Breakdown
                  </p> {/*Object JavaScript का built-in global object है & entries() उसकी method है & ye result.scoreBreakdown Object ko ko arry me badal deta h */}
                  {Object.entries(result.scoreBreakdown).map(([key, val]) => (// map isi arry pe chl rha h jha hr item khud ek arry h isiliye key & val use hua or [] for arr destructring & {} for Obj destructring
                    <div className="flex flex-col gap-1.5" key={key}>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60 capitalize">{key}</span>
                        <span className={`font-semibold ${scoreColor(val.score)}`}>
                          {val.score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                       <div className={`h-full bg-linear-to-r ${scoreBar(val.score)} 
                       rounded-full transition-all duration-700`}
                       style={{width: `${val.score}%` }}
                       />
                       </div>
                       <p className="text-xs text-white/35">{val.feedback}</p>
                    </div>
                  ))}
                </div>
                
                <div className="glass-card p-6 flex flex-col gap-3">{/*ye col me aayega kyuki upr vale row kr available remaining width में fit नहीं हो रहा*/}
                  <p className="text-xs text-white/30 uppercase tracking-widest">
                  Strenths
                  </p>
                  {result.strengths.map((s,i)=>(
                    <div key={i} 
                    className="flex items-start gap-2 text-sm text-white/60">{/*items-start: icon और text को top से align करो*/}
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5"//shrink-0: "space कम पड़े तब भी मुझे छोटा मत करो"
                      />{" "} 
                      {s}                     
                    </div>
                  ))}
                </div>

                <div className="glass-card p-6 flex flex-col gap-4">
                  <p className="text-xs text-white/30 uppercase tracking-widest ">
                  Suggestions
                  </p>
                  {
                    result.suggestions.map((s,i)=>(
                      <div key={i}
                       className={`p-4 rounded-xl border flex flex-col gap-2 
                        ${prioBg[s.priority]}`}>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white/80">
                            {s.category}
                            </span>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${prioColor[s.priority]}`}>
                            {s.category}
                            </span>
                          </div>
                          <p className="text-sm text-white/50">{s.issue}</p>
                          <div className="flex items-start gap-2 text-sm text-white/70">
                           <ChevronRight size={14}
                           className="shrink-0 mt-0.5 text-indigo-400"
                           />
                           {s.recommendation}
                          </div>
                      </div>
                    ))}

                    <button 
                    onClick={() => downloadReport(result)}
                    className="btn-primary flex items-center justify-center gap-2 
                     py-3.5 rounded-xl text-sm font-semibold  "
                     >
                      <Download size={16}/> Download Report
                    </button>
                </div>
              </div>
              </>
            )} 
        </div>
      </div>
    </div>
  )
}

export default AnalysePage




