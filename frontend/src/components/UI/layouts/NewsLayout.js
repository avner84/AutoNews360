
import { Outlet } from "react-router-dom";
import NewsNavbar from '../navbars/NewsNavBar'

const NewsLayout = () => {

  return (
     
        <>
          <NewsNavbar />
          <Outlet />
        </>
    
  )
  }
export default NewsLayout