const userModel = require("../db/models/user.model");
const auditModel = require("../db/models/audit.model");
const taskModel = require("../db/models/task.model");
const sessionModel = require("../db/models/session.model");
const { auditLog } = require("./auth.controller");
async function deleteAccount(req, res) {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await auditLog(req, "Delete Failed-User not found", user);
      return res.redirect("/secure/admin?error=User not found");
    }
    user.isDeleted = true;
    await user.save();
    await auditLog(req, "Delete Successfull", user);
    res.redirect("/secure/admin?delete=true");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function resotreAccount(req, res) {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await auditLog(req, "Restore Failed-User not found", user);
      return res.redirect("/secure/admin?error=User not found");
    }
    user.isDeleted = false;
    await user.save();
    await auditLog(req, "Restore Successfull", user);
    res.redirect("/secure/admin?restore=true");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function getAdmin(req, res) {
  try {
    const users = await userModel.find({role:"user" });
    const audits = await auditModel
      .find()
      .populate("user")
      .limit(10)
      .sort({ createdAt: -1 });
    const tasks = await taskModel.find().populate("userId");
    const sessions = await sessionModel.find().populate("userId").populate("taskId");
    res.render("admin", { users, audits, admin: req.user, tasks, sessions });
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
}

async function getUser(req, res) {
  try {
    const users = await taskModel
      .find({ userId: req.user._id })
      .populate("userId");
    const sessions = await sessionModel
      .find({ userId: req.user._id })
      .populate("userId").populate("taskId");
      const tasks = await taskModel.find({ userId: req.user._id }).populate("userId");
    res.render("user", { users, user: req.user,tasks, sessions });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

module.exports = {
  getAdmin,
  getUser,
  deleteAccount,
  resotreAccount,
};