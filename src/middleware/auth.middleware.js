const jwt = require("jsonwebtoken");
const userModel = require("../db/models/user.model");
async function verifyToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/auth/login?error=Unauthorized user");
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode.id);
    if (!user) {
      res.clearCookie("token");
      return res.redirect("/auth/login?error=Unauthorized user");
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.clearCookie("token");
    res.redirect("/auth/login?error=Unauthorized user");
  }
}

function allowAccess(roles) {
  return (req, res, next) => {
    try {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.redirect("/auth/login?error=Unauthorized user");
      }
    } catch (err) {
      console.log(err);
      res.redirect("/auth/login?error=Unauthorized user");
    }
  };
}
module.exports = {
  verifyToken,
  allowAccess,
};
