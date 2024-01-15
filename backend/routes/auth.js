const express = require("express");
const router = express.Router();
const {
  signup,
  verify,
  requestResendVerification,
  updateVerification,
  login,
  loginByToken
} = require("../controllers/auth");
const {
  signupValidations,  
  loginValidations 
} = require("../validations/auth");

const {handleValidationErrors} = require("../validations/errorHandling");

const isAuth = require("../middleware/is-auth");

router.put("/signup", [signupValidations, handleValidationErrors], signup);

router.get("/verify", verify);

router.get("/resend-verification", requestResendVerification);

router.get("/update-verification", updateVerification);

router.post("/login", [loginValidations, handleValidationErrors], login);

router.post("/login-by-token", isAuth, loginByToken);


module.exports=router;
