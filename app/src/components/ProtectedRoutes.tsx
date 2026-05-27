import { useAppData } from "../context/AppContext"
import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoutes = () => {
  const { isAuth, loading } = useAppData()
     
  if(loading) return null;
  if(!isAuth){
    return <Navigate to={"/login"} replace/>//mtlb agr use login nhi h to use login page pr bhej do
  }

  return <Outlet/>

}

export default ProtectedRoutes;
