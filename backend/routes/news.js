const express = require('express');
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const newsController = require('../controllers/news')


router.get(
    '/latest-articles',
    newsController.getArticles
)

router.get(
    '/article',
    isAuth,
    newsController.getArticleById
)

module.exports = router;