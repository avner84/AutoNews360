const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const { getArticles, getArticleById } = require("../controllers/news");

router.get("/latest-articles", getArticles);

router.get("/article", isAuth, getArticleById);

module.exports = router;
