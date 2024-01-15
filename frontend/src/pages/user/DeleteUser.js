import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../store/UserContext';
import styles from './DeleteUser.module.css';

import config from '../../config/default'
const {REACT_APP_API_URL} = config;


const DeleteUser = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

   // Handles the initial delete button click
  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  // Handles the cancel button click
  const handleCancelClick = () => {
    setIsDeleting(false);
    setError('');
  };

   // Handles the confirmation of user deletion
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${REACT_APP_API_URL}/user/delete-user`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clearing user data and redirecting after successful deletion
        localStorage.removeItem('token');
        setUser(null);
        navigate('/'); // Redirect to homepage
      } else {
        throw new Error('Failed to delete the account.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.deleteUser}>
      {!isDeleting && (
        <>
          <h3>Deleting a user account</h3>
          <button onClick={handleDeleteClick}>Delete account</button>
        </>
      )}
      {isDeleting && (
        <>
          <h3>Are you sure you want to delete the user account?</h3>
          <div className={styles.deleteUserBtnsContainer}>
            <button onClick={handleConfirmDelete}>Yes</button>
            <button onClick={handleCancelClick}>No</button>
          </div>
        </>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default DeleteUser;
