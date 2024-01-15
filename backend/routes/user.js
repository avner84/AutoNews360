const express = require("express");
const router = express.Router();

const { changePassword, deleteUser, userEdit } = require("../controllers/user");

const {
  changePasswordValidations,
  editUserValidations,
} = require("../validations/user");

const {handleValidationErrors} = require("../validations/errorHandling");

const isAuth = require("../middleware/is-auth");

router.patch(
  "/change-password",
  isAuth,
  [changePasswordValidations,
  handleValidationErrors],
  changePassword
);

router.delete("/delete-user", isAuth, deleteUser);

router.patch(
  "/edit-user",
  isAuth,
  [editUserValidations,
  handleValidationErrors],
  userEdit
);

module.exports = router;
