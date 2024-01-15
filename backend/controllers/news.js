
const { findLatestArticles, findArticle } = require('../data-access/news');
const {findUserById} = require('../data-access/auth')

exports.getArticles = async (req, res, next) => {
  try {
    // Find the last 10 articles, sorted by publication date (newest first)
    // Exclude the content field from the result
    const newsArticles = await findLatestArticles(10);
    res.status(200).json({
      message: "Fetched news articles successfully.",
      newsArticles,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getArticleById = async (req, res, next) => {
  const articleId = req.query.id;
  const { userId } = req;

  try {
    // Only a registered and verified user can view the article content
    const user = await findUserById(userId);
    if (!user || !user.isActive) {
      const error = new Error("Access denied: User not found or inactive.");
      error.statusCode = 401;
      return next(error);
    }

    const article = await findArticle({ _id: articleId });
    if (!article) {
      const error = new Error("Article not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Fetched article by id successfully.",
      article,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
