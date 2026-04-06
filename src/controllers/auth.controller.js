const userModel = require("../db/models/user.model");
const auditModel = require("../db/models/audit.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
async function auditLog(req, action, user) {
  try {
    const audit = new auditModel({
      user: user?._id || req.user?._id || null,
      action,
      method: req.method,
      route: req.originalUrl,
      ip: req.ip,
      device: req.headers["user-agent"],
    });
    await audit.save();
  } catch (error) {
    console.log(error);
  }
}

async function getRegister(req, res) {
  res.render("register");
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      await auditLog(req, "Register Failed-User already exists", user);
      return res.redirect("/auth/register?error=User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const nser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    await auditLog(req, "Register Successfull", nser);
    res.redirect("/auth/login?register=true");
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
}

async function getLogin(req, res) {
  res.render("login");
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      await auditLog(req, "Login Failed-User not found");
      return res.redirect("/auth/login?error=User not found");
    }
    if (user.isDeleted) {
      await auditLog(req, "Login Failed-User deleted", user);
      return res.redirect("/auth/login?error=User deleted");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await auditLog(req, "Login Failed-Incorrect password", user);
      return res.redirect("/auth/login?error=Incorrect password");
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );
    await auditLog(req, "Login Successfull", user);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.redirect(`/secure/${user.role}?Welcome_Sir`);
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token");
    await auditLog(req, "Logout Successfull");
    res.redirect("/auth/login?Logout_success");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

module.exports = {
  getRegister,
  register,
  auditLog,
  getLogin,
  login,
  logout,
};