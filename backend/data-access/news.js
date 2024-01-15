const News = require("../models/news");

const findArticle  = async (query) => {
  return await News.findOne(query);
}

const createAndSaveArticle = async (articleData) => {
  const newArticle = new News(articleData);
  await newArticle.save();
  return newArticle;
}

const findLatestArticles = async (limit = 10) => {
    return await News.find()
                     .sort({ pubDate: -1 })
                     .limit(limit)
                     .select('-content');
  }


module.exports = { findArticle , createAndSaveArticle, findLatestArticles };
