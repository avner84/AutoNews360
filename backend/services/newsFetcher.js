require("dotenv").config();
const fetch = require("node-fetch"); // Importing the fetch function
const News = require("../models/news");
const {
  logToFile,
  readLastAvatar,
  saveLastAvatar,
} = require("../utils/logger");

exports.fetchAndSaveNews = async () => {
  try {
    const response = await fetch(process.env.NEWSDATA_API_URL);
    const data = await response.json();

    let articlesSaved = 0;
    let totalArticles = 0;
    let savedArticles = [];
    let savedTitles = [];
    let currentAvatar = readLastAvatar();

    for (const article of data.results) {
      totalArticles++;

      // Check if the article already exists in the database
      const existingArticle = await News.findOne({
        provider_article_id: article.article_id,
      });

      // If the article doesn't exist and all required fields are present and the content is not too short (at least 231 characters)
      if (
        !existingArticle &&
        article.title &&
        article.link &&
        article.content &&
        article.content.length > 230 &&
        article.description &&
        article.pubDate &&
        article.image_url &&
        article.category
      ) {
        const newArticle = new News({
          provider_article_id: article.article_id,
          title: article.title,
          link: article.link,
          author:
            Array.isArray(article.creator) && article.creator.length > 0
              ? article.creator[0]
              : "Author not found",
          content: article.content,
          description: article.description,
          pubDate: new Date(article.pubDate),
          image_url: article.image_url,
          category: article.category[0],
          avatar: currentAvatar,
        });

        await newArticle.save();
        articlesSaved++;
        savedTitles.push(article.title);
        savedArticles.push(article);

        // Alternating the avatar
        currentAvatar = currentAvatar === "Sofia" ? "Jack" : "Sofia";
        saveLastAvatar(currentAvatar); // Save the current state of the avatar
      }
    }

    const logData = {
      fetched: totalArticles,
      saved: articlesSaved,
      fetchedArticles: data.results.map((article, index) => ({
        number: index + 1,
        title: article.title,
        link: article.link,
        article_id: article.article_id,
      })),
      savedArticles: savedArticles.map((article, index) => ({
        number: index + 1,
        title: article.title,
        link: article.link,
        article_id: article.article_id,
        category: article.category[0],
        avatar: article.avatar,
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
