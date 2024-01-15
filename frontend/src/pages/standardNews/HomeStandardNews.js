import styles from "./HomeStandardNews.module.css";
import { useLoaderData, useNavigate, Link } from "react-router-dom";
import React, { useState } from 'react';
import { useUser } from "../../store/UserContext";
import Modal from '../../components/UI/modal/Modal';

import config from '../../config/default'
const {REACT_APP_API_URL} = config;


// HomeStandardNews component displays the main news articles on the home page.
const HomeStandardNews = () => {
  const articles = useLoaderData();

  const navigate = useNavigate();
  const { user } = useUser();

  // Handles clicking on an article. If user is not logged in, opens a modal.
  // If logged in, navigates to the article page.
  const handleArticleClick = (articleId) => {
    if (!user) {
      openModal();
    } else {
      navigate(`/news/${articleId}`);
    }
  };

  // State and functions to handle modal visibility
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className={styles.newsContainer}>
      
       <Modal show={showModal} onClose={closeModal}>        
        <p className={styles.modalContent}>In order to view the article, you must <Link to="/login">log in</Link> or <Link to="/signup">register</Link> to the site.</p>
      </Modal>

      {articles?.length > 0 ? (
        <>
        {/* mainArticle */}
          <div
            className={styles.mainArticle}
            onClick={() => handleArticleClick(articles[0]._id)}
          >
            <div className={styles.mainArticleContent}>
              <h1>{articles[0].title}</h1>
              <p>{articles[0].description}</p>
              <small>For the full story...</small>
            </div>
            <div className={styles.mainArticleImage}>
              <img src={articles[0].image_url} alt={articles[0].title} />
            </div>
          </div>

          {/* 3 sub-articles displayed beneath the main article  */}
          <div className={styles.subArticlesContainer}>
            {articles.slice(1, 4).map(({ _id, title, description, image_url }, index) => (
              <div
                key={_id}
                className={styles.subArticle}
                onClick={() => handleArticleClick(_id)}
              >
                <div className={styles.subArticleImgContainer}>
                  <img src={image_url} alt={title} />
                </div>
                <div
                  className={styles.subArticleContent}
                  style={index === 1 ? { backgroundColor: "#003366" } : {}}
                >
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.diverLine}>
            <h3>More news</h3>
          </div>

          {/* Previous articles appear at the bottom of the page */}
          <div className={styles.miniArticlesContainer}>
            {articles.slice(4, 10).map(({_id, image_url, title, }) => (
              <div
                key={_id}
                className={styles.miniArticle}
                onClick={() => handleArticleClick(_id)}
              >
                <div className={styles.miniArticleImgContainer}>
                  <img src={image_url} alt={title} />
                </div>
                <div className={styles.miniArticleContent}>
                  <h5>{title}</h5>
                </div>
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

// newsLoader function fetches the latest articles from the server.
// In case of an error, it returns an empty array.
export const newsLoader = async () => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/news/latest-articles`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { newsArticles } = await response.json();

    return newsArticles;
  } catch (error) {
    console.error("Failed to load articles:", error);
    return []; //If no articles are retrieved from the server, the function will return an empty array
  }
}

export default HomeStandardNews;
