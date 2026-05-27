import axios from "axios";
import {createContext, useContext, useEffect, useState, type ReactNode} from "react";

import toast, {Toaster} from "react-hot-toast";//toast ek chota popup msg hota h jo todi der k liye screen pr ata h, toaster:यह toast messages दिखाने वाली machine है 
import type { AppContextType, User } from "../types";
import {server} from "../main";


const AppContext = createContext<AppContextType | undefined>(undefined);
//createContext() का काम होता है पूरे app में data share करना बिना props passing के।
//AppContextType mtlb context के अंदर कौन-कौन सी values होंगी उसका structure, jo ki already defined h types.tsx me
// | means initial value of context undefined b/c of no initial value in starting

interface AppProps {//यह TypeScript को बताता है: AppProvider component को कौन-कौन से props मिलेंगे
    children: ReactNode// mtlb children कोई भी valid JSX हो सकता है। eg <App />, <Home />
}//ReactNode: React में जो कुछ render हो सकता है वो ReactNode कहलाता है। egJSX, strig, number,component


//yha AppProvider naam ka component ban rha h, ye pure <App/> ko data provide krega
export const AppProvider = ({children}: AppProps)=>{// means children props h jo paas hoga vha se और उसकी type AppProps होगी।
    const [user, setUser ] = useState<User | null>(null)//शुरू में कोई user login नहीं है।
    const [isAuth, setIsAuth] = useState(false)//मतलब शुरू में login नहीं माना जाएगा।
    const [loading, setLoading] = useState(true)

    async function fetchUser() {
        try {
            const {data} = await axios.get(`${server}/api/user/me`,{
            headers:{
                Authorization: `Bearer ${localStorage.getItem("token")}`,//Browser storage से token निकाल रहा है।
             },//means यह token backend को भेज रहा है,Backend check करेगा token valid है या नहीं।
            });

            setUser(data);
            setIsAuth(true);

        } catch (error) {
            console.log(error);       
        }finally{
          setLoading(false)// mentor not wrote it
        }
    }

    const LogoutUser = ()=>{
        localStorage.setItem("token", "")//Token empty कर दिया।
        setUser(null)
        setIsAuth(false)
        toast.success("Logged Out")//Screen पर success popup दिखेगा।
    };

    useEffect(()=>{
        fetchUser();
    },[]);//Empty dependency array मतलब:सिर्फ पहली render पर चलाओ।

    return (//neeche di gyi sari values pure app me available hongi
        <AppContext.Provider value={{isAuth, loading, setIsAuth, setLoading, setUser, user, LogoutUser }}>
        {children} {/*children likhne se ab app ke undr jitne v components h like Home,Login,etc sbko context mil jayega*/}
        <Toaster/>
        </AppContext.Provider>
    )
};

export const useAppData = (): AppContextType =>{//Custom hook बनाया गया। ताकि आसानी से context access कर सको।
    const context = useContext(AppContext);

    if(!context){
        throw new Error("useAppData must be used within AppProvider")
    }
    return context;
}
