import { useAppData } from "../context/AppContext"
import { Navigate, Outlet } from "react-router-dom";


const PublicRoutes = () => {
  const { isAuth, loading } = useAppData()
     
  if(loading) return null;
  return isAuth ? <Navigate to={"/"} replace/> : <Outlet />

}
//why replace : browser history me current page ko replace kar do
export default PublicRoutes
