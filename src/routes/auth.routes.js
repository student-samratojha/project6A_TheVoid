const router = require("express").Router();
const { verifyToken } = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");
router.get("/register", authController.getRegister);
router.post("/register", authController.register);
router.get("/login", authController.getLogin);
router.post("/login", authController.login);
router.get("/logout",verifyToken, authController.logout);
module.exports = router;