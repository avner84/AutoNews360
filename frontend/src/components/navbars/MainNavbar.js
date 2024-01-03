import React, { useState, useEffect } from "react";
import styles from "./MainNavbar.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../store/UserContext";

const MainNavbar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Toggles the display of the profile menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Handles user logout, removes token and resets user context
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser();
    navigate("/");
  };


// Fetch user data if a token is stored and no user data is present
  useEffect(() => {
    if (!user) {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchData = async () => {
        try {
          // Sending a request to validate the token
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login-by-token`, {
            method: 'POST',
            headers: {              
                'Authorization': `Bearer ${token}`
            }
          });
  
          // Handling unsuccessful token validation
          if (!response.ok) {
            throw new Error('Token validation failed');
          }
  
           // Setting user data on successful validation
          const userData = await response.json();
          localStorage.setItem('token', userData.token);
          setUser(userData.user);
        } catch (error) {
           console.error(error);
          localStorage.removeItem("token");
        }
      };
  
      fetchData();
    }
    }
  }, [user, setUser]);
  

  
  return (
    <header className={styles.navbar}>
      <nav>
        <NavLink to="/" className={styles.logo}>
          <h1>AutoNews360</h1>
        </NavLink>
        {user ? (
          <>
            <FontAwesomeIcon
              icon={faUser}
              className={styles.iconProgile}
              onClick={toggleProfileMenu}
            />
            {isProfileMenuOpen && (
              <div className={styles.profileMenu}>
                <NavLink className={styles.profileMenuNav} to="/user/edit">Edit Profile</NavLink>
                <NavLink className={styles.profileMenuNav}  to="/user/change-password">Change Password</NavLink>
                <NavLink className={styles.profileMenuNav}  to="/user/delete-account">Delete Account</NavLink>
                <p className={styles.logout} onClick={handleLogout}>
                  Logout
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              Sign Up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default MainNavbar;
