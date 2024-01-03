import styles from "./HomeAvatarNews.module.css";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useUser } from "../../store/UserContext";
import Modal from "../../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";

import SofiaAvatar from "./avatarImages/Sofia-image.png";
import JackAvatar from "./avatarImages/Jack-image.png";

// HomeAvatarNews component displays news articles presented by avatars.
const HomeAvatarNews = () => {
  // Loading articles data using useLoaderData
  const articles = useLoaderData();

  const navigate = useNavigate();
  const { user } = useUser();

  // Handles clicking on an article. If user is not logged in, opens a modal.
  // If logged in, navigates to the article's avatar presentation page.
  const handleArticleClick = (articleId) => {
    if (!user) {
      openModal();
    } else {
      navigate(`/avatars/${articleId}`);
    }
  };

  // State and functions to handle modal visibility
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className={styles.avatarNewsContainer}>
      <Modal show={showModal} onClose={closeModal}>
        {/* Your modal content goes here */}
        <p className={styles.modalContent}>
          n order to view the articles presented by avatars, you must{" "}
          <Link to="/login">log in</Link> or <Link to="/signup">register</Link>{" "}
          to the site.
        </p>
      </Modal>

      {articles && articles.length > 0 ? (
        <>
          <header className={styles.header}>
            <h1>
              Beyond Words: Avatars Bring News to Life in the Virtual World
            </h1>
            <h2>
              Click on an article to watch it presented by an Avatar, an
              innovative experience in news reading!
            </h2>
          </header>

          {/* The first two main articles presented by the avatars display the avatar's image stored in the article object. */}
          <div className={styles.mainArticlesContainer}>
            {articles.slice(0, 2).map((article, index) => (
              <div
                key={article._id}
                className={styles.mainArticle}
                onClick={() => handleArticleClick(article._id)}
              >
                <img
                  src={article.avatar === "Sofia" ? SofiaAvatar : JackAvatar}
                  alt={article.title}
                />
                <h2>
                  <FontAwesomeIcon icon={faVideo} /> {article.title}
                </h2>
              </div>
            ))}
          </div>

          {/* Eight additional articles are displayed in a smaller format with the original image of the article */}
          <div className={styles.miniArticlesContainer}>
            {articles.slice(2, 10).map((article) => (
              <div
                key={article._id}
                className={styles.miniArticle}
                onClick={() => handleArticleClick(article._id)}
              >
                <img src={article.image_url} alt={article.title} />
                <h4>
                  <FontAwesomeIcon icon={faVideo} /> {article.title}
                </h4>
              </div>
            ))}
          </div>
        </>
      ) : (
        <h2>There was an error on the site. Please try to enter later.</h2>
      )}
    </div>
  );
};

// avatarNewsLoader function fetches the latest articles from the server.
// In case of an error, it returns an empty array.
export async function avatarNewsLoader() {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/news/latest-articles`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data.newsArticles;
  } catch (error) {
    console.error("Failed to load articles:", error);
    return []; //If no articles are retrieved from the server, the function will return an empty array
  }
}

export default HomeAvatarNews;
