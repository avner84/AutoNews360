import { useState, useEffect } from "react";
import { Form, useActionData, useSubmit } from "react-router-dom";
import styles from "./SignUp.module.css";
import BeatLoader from "react-spinners/BeatLoader";

import config from '../../config/default'
const {REACT_APP_API_URL} = config;


export default function SignUpForm() {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const data = useActionData();
  const submit = useSubmit(); // Hook for form submission

  const override = {
    marginTop: "20px",
  };

  // When the success message is received from the action, update the state variable
  if (data?.success && !isSignedUp) {
    setIsSignedUp(true);
  }

 // Handling form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Add validity checks here, before activating the BeatLoader
    if (formData.get("password") !== formData.get("confirmPassword")) {
      // Display error and do not proceed
      setErrorMessage("Passwords do not match.");
      return;
    }

    // If everything is fine, proceed
    setIsSubmitting(true);
    submit(formData, { method: "post", action: "/signup" });
  };

  useEffect(() => {
    if (data) {
      setIsSubmitting(false); // Turn off the BeatLoader whenever a result is received
      if (data.success) {
        setIsSignedUp(true); // If the registration was successful
      }
    }
  }, [data]);

   // If the user has successfully signed up, display a message instead of the form
  if (isSignedUp) {
    return (
      <div className={styles.successMessageContainer}>
        <p className={styles.successMessage}>
          Your registration to the site has been successfully completed. To
          complete the activation process, please check your email inbox and
          click on the verification link we sent.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.signUp}>
      <h3>Sign Up</h3>
      <Form method="post" action="/signup" onSubmit={handleSubmit}>
        <label>
          <span>First Name:</span>
          <input type="text" name="firstName" required />
        </label>
        <label>
          <span>Last Name:</span>
          <input type="text" name="lastName" required />
        </label>
        <label>
          <span>Email:</span>
          <input type="email" name="email" required />
        </label>
        <label>
          <span>Password:</span>
          <input type="password" name="password" required />
        </label>
        <label>
          <span>Confirm Password:</span>
          <input type="password" name="confirmPassword" required />
        </label>
        {!isSubmitting ? (
          <button type="submit" disabled={isSubmitting}>
            Sign Up
          </button>
        ) : (
          <BeatLoader color="#0056b3" cssOverride={override} />
        )}
        {errorMessage && !isSubmitting &&  <p className={styles.error}>{errorMessage}</p>}
        {data?.error && !isSubmitting && <p className={styles.error}>{data.error}</p>}
      </Form>
    </div>
  );
}


export const signUpAction = async ({ request }) => {
  const data = await request.formData();

  const firstName = data.get("firstName");
  const lastName = data.get("lastName");
  const email = data.get("email");
  const password = data.get("password");
  const confirmPassword = data.get("confirmPassword");



  // Check if passwords match
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // Check password length
  if (password.length < 6) {
    return { error: "Password must be over 6 chars long." };
  }

  // Send your PUT request to sign up the user
  try {
    const response = await fetch(`${REACT_APP_API_URL}/auth/signup`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
    });

    const result = await response.json();

    // Check if the signup was successful
    if (response.ok) {
      return { success: true };
    } else {
      // Handle server errors (e.g., email already in use)
      return { error: result.message };
    }
  } catch (error) {
    // Handle network errors
    return { error: error.message || "Network error" };
  }
};


