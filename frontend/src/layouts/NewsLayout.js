
import { Outlet } from "react-router-dom";
import NewsNavbar from '../components/navbars/NewsNavBar'

const NewsLayout = () => {

  return (
     
        <>
          <NewsNavbar />
          <Outlet />
        </>
    
  )
  }
export default NewsLayout