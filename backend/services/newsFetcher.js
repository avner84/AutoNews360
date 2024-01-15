const fetch = require("node-fetch"); // Importing the fetch function
const {NEWSDATA_API_URL} = require('../config/vars')

const {
  logToFile,
  readLastAvatar,
  saveLastAvatar,
} = require("../utils/logger");
const { findArticle, createAndSaveArticle } = require("../data-access/news");

exports.fetchAndSaveNews = async () => {
  try {
    const response = await fetch(NEWSDATA_API_URL);
    const data = await response.json();

    let articlesSaved = 0;
    let totalArticles = 0;
    let savedArticles = [];
    let savedTitles = [];
    let currentAvatar = readLastAvatar();

    for (const article of data.results) {
      totalArticles++;

      const {
        title,
        link,
        content,
        description,
        pubDate,
        image_url,
        category,
        article_id,
        creator,
      } = article;

      // Check if the article already exists in the database
      const existingArticle = await findArticle({ provider_article_id: article_id });

      // If the article doesn't exist and all required fields are present and the content is not too short (at least 231 characters)
      if (
        !existingArticle &&
        title &&
        link &&
        content?.length > 230 &&
        description &&
        pubDate &&
        image_url &&
        category
      ) {
        const articleData = {
          title,
          link,
          content,
          description,
          image_url,
          provider_article_id: article_id,
          author: creator?.[0] || "Author not found",
          pubDate: new Date(pubDate),
          category: category[0],
          avatar: currentAvatar
        };

        await createAndSaveArticle(articleData);
        articlesSaved++;
        savedTitles.push(title);
        savedArticles.push(article);

        // Alternating the avatar
        currentAvatar = currentAvatar === "Sofia" ? "Jack" : "Sofia";
        saveLastAvatar(currentAvatar); // Save the current state of the avatar
      }
    }

    const logData = {
      fetched: totalArticles,
      saved: articlesSaved,
      fetchedArticles: data.results.map(({ title, link, article_id }, index) => ({
        number: index + 1,
        title,
        link,
        article_id,
      })),
      savedArticles: savedArticles.map(({ title, link, article_id, category, avatar }, index) => ({
        number: index + 1,
        title,
        link,
        article_id,
        category: category[0],
        avatar,
      })),
    };

    // Calling the function to log to the file
    logToFile(logData);

    console.log(`Total articles fetched: ${totalArticles}`);
    console.log(`Articles saved to MongoDB: ${articlesSaved}`);
    console.log("Titles of saved articles:", savedTitles);
  } catch (error) {
    console.error("Error fetching and saving news:", error);
  }
};
