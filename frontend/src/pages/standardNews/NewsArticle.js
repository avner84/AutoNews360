import styles from "./NewsArticle.module.css";
import { useLoaderData, Link } from "react-router-dom";
import { useUser } from "../../store/UserContext";

const NewsArticle = () => {
  const { article, error } = useLoaderData();
  const { setUser } = useUser();

   // Handle different types of errors
  if (error) {
    let errorMessage = (
      <h2>There was an error on the site. Please try to enter later.</h2>
    );
    if (error.message === "Authentication failed. Please log in.") {
      errorMessage = (
        <p className={styles.accessDeniedAlert}>
          In order to view the article, you must <Link to="/login">log in</Link>{" "}
          or <Link to="/signup">register</Link> to the site.
        </p>
      );
      localStorage.removeItem("token");
      setUser();
    } else if (error.message === "Article not found.") {
      errorMessage = <h2>Article not found.</h2>;
    } else if (error.message === "Server error. Please try again later.") {
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

   // Render the article
  return (
    <div className={styles.articleContainer}>
      {article ? (
        <>
          <h1>{article.title}</h1>
          <h2>{article.description}</h2>
          <hr />
          <div className={styles.articleDetails}>
            <p className={styles.category}>category: {article.category[0]}</p>
            <p className={styles.publishDate}>{article.pubDate}</p>
          </div>
          <img src={article.image_url} alt={article.title} />
          <p className={styles.content}>{article.content}</p>
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
      `${process.env.REACT_APP_API_URL}/news/article?id=${articleId}`,
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

    const data = await response.json();
    return { article: data.article };
  } catch (error) {
    console.error("Failed to load blog:", error);
    return { error };
  }
}

export default NewsArticle;
