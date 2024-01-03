import { Form, useActionData, useNavigate, useSubmit, Link } from "react-router-dom";
import BeatLoader from "react-spinners/BeatLoader";
import styles from "./Login.module.css";
import { useState, useEffect } from "react";
import { useUser } from "../../store/UserContext";

export default function LoginForm() {
  const data = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const override = {
    margin: "20px",
  };

  // useEffect hook that runs when 'data' changes, primarily intended for handling login success
  useEffect(() => {
    // Check if we received data from the action
    if (data) {
      setIsLoading(false); // Turn off loading mode

      if (data?.user) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/"); // Navigate to home page after successful login
      }
    }
  }, [data, navigate, setUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Activate loading mode

    const formData = new FormData(event.currentTarget);
    submit(formData, { method: "post" }); // Send the data to the action
  };

  return (
    <div className={styles.login}>
      <h3>Login</h3>
      <Form method="post" action="/login" onSubmit={handleSubmit}>
        <label>
          <span>Email:</span>
          <input type="email" name="email" required />
        </label>
        <label>
          <span>Password:</span>
          <input type="password" name="password" required />
        </label>
        {isLoading ? (
          <BeatLoader color="#0056b3" cssOverride={override} />
        ) : (
          <button type="submit">Login</button>
        )}

        {data && data.error && !isLoading &&<p className={styles.error}>{data.error}</p>}
        
        {data && data.error && !isLoading && data.error.includes("User account is not active.") && (
        <p className={styles.verificationPrompt} >
          To receive a new verification code, please click{" "}
          <Link to="/verification-results?status=expired">here</Link>.
        </p>
      )}       
      </Form>
    </div>
  );
}

// loginAction: Handles the POST request for user login
export const loginAction = async ({ request }) => {
  const data = await request.formData();
  const email = data.get("email");
  const password = data.get("password");

  // Validating password length
  if (password.length < 6) {
    return { error: "Password must be over 6 chars long." };
  }

  try {
    // Sending login request to the server
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    // Handling unsuccessful login attempts
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || "Something went wrong" };
    }

    // Processing successful login response
    const { user, token } = await response.json();
    return { user, token };
  } catch (error) {
    // Handling network or server errors
    return { error: error.message || "Failed to connect to the server" };
  }
};
