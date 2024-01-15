const express = require('express');
const router = express.Router();

const newsRoutes = require("./news");
const authRoutes = require("./auth");
const userRoutes = require("./user");

router.use("/auth", authRoutes);
router.use("/news", newsRoutes);
router.use("/user", userRoutes);

module.exports = router;
