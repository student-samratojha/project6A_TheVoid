const taskModel = require("../db/models/task.model");
const userModel = require("../db/models/user.model");
const sessionModel = require("../db/models/session.model");
const { auditLog } = require("./auth.controller");

async function getAddTask(req, res) {
  try {
    res.render("add-task", { user: req.user });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function addTask(req, res) {
  try {
    const { title, priority, description, category, deadline } = req.body;

    await taskModel.create({
      title,
      priority,
      description,
      category,
      deadline,
      userId: req.user._id,
    });

    await auditLog(req, "Task Added Successfully");

    res.redirect("/secure/user?task=true");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.body;

    const task = await taskModel.findById(id);

    if (!task) {
      await auditLog(req, "Delete Failed - Task not found");
      return res.redirect(`/secure/${req.user.role}?error=Task not found`);
    }

    if (
      task.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      await auditLog(req, "Delete Failed - Unauthorized user");
      return res.redirect(`/secure/${req.user.role}?error=Unauthorized user`);
    }

    if (task.status === "completed") {
      const user = await userModel.findById(req.user._id);

      if (user.streak > 0) {
        user.streak -= 1;
        await user.save();
      }
    }

    task.isDeleted = true;
    await task.save();

    await auditLog(req, "Delete Successfully");

    res.redirect(`/secure/${req.user.role}?delete=true`);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function restoreTask(req, res) {
  try {
    const { id } = req.body;

    const task = await taskModel.findById(id);

    if (!task) {
      await auditLog(req, "Restore Failed - Task not found");
      return res.redirect(`/secure/${req.user.role}?error=Task not found`);
    }

    if (
      task.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      await auditLog(req, "Restore Failed - Unauthorized user");
      return res.redirect(`/secure/${req.user.role}?error=Unauthorized user`);
    }

    task.isDeleted = false;
    await task.save();

    if (task.status === "completed") {
      await userModel.findByIdAndUpdate(req.user._id, {
        $inc: { streak: 1 },
      });
    }

    await auditLog(req, "Restore Successfully");

    res.redirect(`/secure/${req.user.role}?restore=true`);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function completeTask(req, res) {
  try {
    const { id } = req.body;

    const task = await taskModel.findById(id);

    if (!task) {
      await auditLog(req, "Complete Failed - Task not found");
      return res.redirect(`/secure/user?error=Task not found`);
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      await auditLog(req, "Complete Failed - Unauthorized user");
      return res.redirect(`/secure/user?error=Unauthorized user`);
    }

    if (task.status === "completed") {
      return res.redirect(`/secure/user?already=true`);
    }

    task.status = "completed";
    task.completedAt = new Date();

    await task.save();

    const totalMinutes = Math.floor(
      (task.completedAt - task.createdAt) / (1000 * 60)
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const durationText =
      hours > 0
        ? `${hours} hour ${minutes} minute`
        : `${minutes} minute`;

    let productivityScore;

    if (totalMinutes <= 30) {
      productivityScore = 10;
    } else if (totalMinutes <= 60) {
      productivityScore = 8;
    } else {
      productivityScore = 6;
    }

    await sessionModel.create({
      duration: totalMinutes,
      note: durationText,
      completed: true,
      sessionType: "focus",
      productivityScore,
      userId: req.user._id,
      taskId: task._id,
    });

    await userModel.findByIdAndUpdate(req.user._id, {
      $inc: { streak: 1 },
    });

    await auditLog(req, `Complete Successfully (${durationText})`);

    res.redirect(`/secure/user?complete=true`);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

module.exports = {
  getAddTask,
  addTask,
  deleteTask,
  restoreTask,
  completeTask,
};
