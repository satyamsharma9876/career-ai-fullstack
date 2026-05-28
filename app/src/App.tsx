import { BrowserRouter,Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/navbar"
import Footer from "./components/footer"
import Login from "./pages/Login"
import Account from "./pages/Account"
import { useAppData } from "./context/AppContext"
import Loading from "./components/loading"
import PublicRoutes from "./components/PublicRoutes"
import ProtectedRoutes from "./components/ProtectedRoutes"
import AnalysePage from "./pages/Analyse"
import JobMatcherPage from "./pages/JobMatcher"

const App = () => {
  const {loading} = useAppData()

  if(loading){
    return <Loading/>
  }
  return (
  <BrowserRouter> {/*यह पूरा app wrap करता है ताकि routing काम कर सके & browser URL को track करता है eg:localhost:5173/, localhost:5173/about*/}
     <Navbar/>
     <Routes>      {/*ye check krta h abhi kon sa url h usi ke hisab se component render krta h*/}
       <Route path="/" element={<Home />} /> {/*means agr url / hai to homepage & element={<Home />} means jb route match hojaye to Home Component dikhao*/}
       <Route element={<PublicRoutes/>} >   
         <Route path="/login" element={<Login />} />
       </Route>
       
       <Route element={<ProtectedRoutes/>} > {/*agr na lagao to user kbhi bhi koi bhi direct URL likh ke protected page open kar sakta hai eg localhost:5173/account*/}
         <Route path="/account" element={<Account />} />
         <Route path="/analyse" element={<AnalysePage />} /> 
           <Route path="/jobmatcher" element={<JobMatcherPage/>} />
       </Route>

     </Routes>
     <Footer/>
  </BrowserRouter>
  )
}


export default App


//publicRoutes & privateRoutes used to show kis page ko login ke bina access karna hai
//aur kis page ko login ke baad hi access karna hai
