import styles from "./Modal.module.css";

export default function Modal({ show, onClose, children }) {
   // If 'show' is false, do not render the Modal
    if (!show) {
      return null;
    }

    // Handles closing of the modal when clicking outside of the modal content
    const handleClose = (e) => {
      // Check if the clicked area is the modal background (not the content)
        if (e.target === e.currentTarget) {
          onClose(); // Call the onClose function passed as a prop
        }
      };
  
    return (
      <div className={styles.modal}  onClick={handleClose}>
        <div className={styles.modalContent}>
            {children}
          <span className={styles.close} onClick={onClose}>&times;</span>
          
        </div>
      </div>
    );
  }
  