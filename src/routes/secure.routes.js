const router = require("express").Router();
const secureController = require("../controllers/secure.controller");
const { verifyToken, allowAccess } = require("../middleware/auth.middleware");
router.get("/admin", verifyToken, allowAccess(["admin"]), secureController.getAdmin);
router.get("/user", verifyToken, allowAccess(["user"]), secureController.getUser);
router.post("/delete", verifyToken, allowAccess(["admin"]), secureController.deleteAccount);
router.post("/restore", verifyToken, allowAccess(["admin"]), secureController.resotreAccount);
module.exports = router;