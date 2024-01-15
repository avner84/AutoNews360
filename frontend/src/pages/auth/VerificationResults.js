import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import BeatLoader from "react-spinners/BeatLoader";
import styles from "./VerificationResults.module.css";

import config from '../../config/default'
const {REACT_APP_API_URL} = config;

const VerificationResults = () => {
  const [status, setStatus] = useState(""); 
  const [emailFromUrl, setEmailFromUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");  
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setStatus(params.get("status"));
    setEmailFromUrl(params.get("email"));
  }, [location]);

  const handleResendClick = async () => {
    setIsLoading(true);
    const emailToSend = emailFromUrl || userEmail;
    try {
       // Perform the request to the server
       const response = await fetch(`${REACT_APP_API_URL}/auth/resend-verification?email=${emailToSend}`);
       const responseData = await response.json();
      if (responseData.redirect) {
        navigate(`/${responseData.redirect}`);
      }    
    } catch (error) {
      console.error("Error resending verification email: ", error);
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.containerResults}>
      {status === "success" && (
        <div>
          <h4>Your verification was successful!</h4>
          <p>
            Your AutoNews360 account has been successfully verified. Now, you
            can start using all our services and content. To log in to the site,
            simply click on 'Login' or <Link to="/login"> here</Link>.
          </p>
        </div>
      )}

      {status === "expired" && emailFromUrl && (
        <div className={styles.expiredDiv}>
          <p>
            It seems that too much time has passed since the verification
            request was sent. To proceed, you need to redo the verification
            process. Please request a new verification link for your AutoNews360
            account by clicking{" "}
            <span className={styles.spanBtn} onClick={handleResendClick}>
              here
            </span>
            .
          </p>
          {isLoading && <BeatLoader color="#0056b3" />}
        </div>
      )}

      {(status === "error" || (status === "expired" && !emailFromUrl)) && (
        <div className={styles.errorDiv}>
          <p>
            Unfortunately, there was an error in the process of verifying your
            account. Please enter your email to request a new verification link.
          </p>
          {!isLoading && (
            <>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <button onClick={handleResendClick}>
                Resend Verification Email
              </button>
            </>
          )}
          {isLoading && <BeatLoader color="#0056b3" />}
        </div>
      )}

      {status === "already-verified" && (
        <div>
          <h4>Your Account is Already Verified!</h4>
          <p>
            It looks like you've tried to verify your AutoNews360 account again,
            but no further action is needed - your account has already been
            successfully verified.
          </p>
          <p>
            To log in and start your experience, simply click on 'Login' or{" "}
            <Link to="/login">here</Link>.
          </p>
        </div>
      )}
      {status === "verification-resent" && (
        <div>
          <h4>Verification Email Resent!</h4>
          <p>
            We've just resent the verification email to your inbox. To complete
            the activation process of your AutoNews360 account, please check
            your email and click on the verification link we've sent.
          </p>
          <p>
            If you don't receive the email within a few minutes, please check
            your spam folder or request another verification email.
          </p>
          <p>
            Thank you for your continued interest in AutoNews360. We're excited
            to have you on board!
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationResults;


