import styles from "./NewsArticle.module.css";
import { useLoaderData, Link } from "react-router-dom";
import { useUser } from "../../store/UserContext";

import config from '../../config/default'
const {REACT_APP_API_URL} = config;


const NewsArticle = () => {
  const { article, error } = useLoaderData();
  const { setUser } = useUser();

   // Handle different types of errors
  if (error) {
    const { message } = error;
    let errorMessage = (
      <h2>There was an error on the site. Please try to enter later.</h2>
    );
    if (message === "Authentication failed. Please log in.") {
      errorMessage = (
        <p className={styles.accessDeniedAlert}>
          In order to view the article, you must <Link to="/login">log in</Link>{" "}
          or <Link to="/signup">register</Link> to the site.
        </p>
      );
      localStorage.removeItem("token");
      setUser();
    } else if (message === "Article not found.") {
      errorMessage = <h2>Article not found.</h2>;
    } else if (message === "Server error. Please try again later.") {
      errorMessage = <h2>Server error. Please try again later.</h2>;
    }
    return <div className={styles.articleContainer}> {errorMessage} </div>;
  }

  // Handle case when no article is found
  if (!article) {
       return (
      <div className={styles.articleContainer}>       
        <h2>Article not found.</h2>
      </div>
    );
  }

  const { title, description, category, pubDate, image_url, content } = article;

   // Render the article
  return (
    <div className={styles.articleContainer}>
      {article ? (
        <>
          <h1>{title}</h1>
          <h2>{description}</h2>
          <hr />
          <div className={styles.articleDetails}>
            <p className={styles.category}>category: {category[0]}</p>
            <p className={styles.publishDate}>{pubDate}</p>
          </div>
          <img src={image_url} alt={title} />
          <p className={styles.content}>{content}</p>
        </>
      ) : (
        <h2>There was an error on the site. Please try to enter later.</h2>
      )}
    </div>
  );
};

// Loader function to fetch the article
export async function articleLoader({ params }) {
  const articleId = params.id;
  const token = localStorage.getItem("token");

  // Deny access if there's no token
  if (!token) {
    return { error: "Access Denied: No token provided." };
  }

  try {
    const response = await fetch(
      `${REACT_APP_API_URL}/news/article?id=${articleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      let error = "Something went wrong";
      if (response.status === 401) {
        error = "Authentication failed. Please log in.";
      } else if (response.status === 404) {
        error = "Article not found.";
      } else if (response.status === 500) {
        const responseJson = await response.json();
        // Check if the error message from the server matches the specific token verification error
        if (
          responseJson.message ===
          "Token verification failed. Please provide a valid token."
        ) {
          error = "Authentication failed. Please log in.";
        } else {
          error = "Server error. Please try again later.";
        }
      }
      throw new Error(error);
    }

    const {article} = await response.json();
    return { article };
  } catch (error) {
    console.error("Failed to load blog:", error);
    return { error };
  }
}

export default NewsArticle;
