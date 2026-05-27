import { Loader2 } from "lucide-react"

export default function Loading(){
    return(
        // <div className="bg-page flex items-center justify-center min-h-screen ">
        //     <div className="flex flex-col items-center gap-4">
        //         <div className="w-10 h-10 rounded-xl bg-linear-to-br from=indigo-500
        //          to-emerald-400 animate-pulse shadow-lg shadow-indigo-500/30">                    
        //          </div>
        //          <p className="text-white/30 text-sm tracking-widest upercase animate-pulse">
        //          Loading...
        //          </p>
        //     </div>
        // </div>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 size={36} className="text-indigo-400 animate-spin"/>
            <p className="text-white/40 text-sm">Loading...</p>
        </div>
    )
}
