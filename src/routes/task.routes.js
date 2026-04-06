const router = require("express").Router();
const taskController = require("../controllers/task.controller");
const { verifyToken, allowAccess } = require("../middleware/auth.middleware");
router.get(
  "/make",
  verifyToken,
  allowAccess(["user"]),
  taskController.getAddTask,
);
router.post(
  "/make",
  verifyToken,
  allowAccess(["user"]),
  taskController.addTask,
);
router.post("/delete", verifyToken, taskController.deleteTask);
router.post("/restore", verifyToken, taskController.restoreTask);
router.post(
  "/complete",
  verifyToken,
  allowAccess(["user"]),
  taskController.completeTask,
);
module.exports = router;
