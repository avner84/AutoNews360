import { NavLink, useLocation } from "react-router-dom";
import styles from "./NewsNavBar.module.css";

const NewsNavBar = () => {
  const location = useLocation();

 
  // This check determines if the current route is an avatar detail page. 
  // The avatar tab remains active on both the main avatars page (e.g., /avatars) 
  // and individual avatar detail pages (e.g., /avatars/659463cc5aae412ed8eeee19). 
  // However, to match the background color of the detail page, 
  // a slightly different class is applied when the URL includes an ID after /avatars/. 
  const isAvatarDetailPage = location.pathname.startsWith("/avatars/") && location.pathname.length > "/avatars/".length;

  return (
    <header className={styles.navbar}>
      <nav>
        <NavLink
          to="/news"
          className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
          News
        </NavLink>
        <NavLink
          to="/avatars"
          className={({ isActive }) => 
            isActive && !isAvatarDetailPage ? styles.active : isAvatarDetailPage ? styles.activePaleBlue : undefined
          }
        >
          Avatars
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
          About
        </NavLink>
      </nav>
    </header>
  );
};

export default NewsNavBar;