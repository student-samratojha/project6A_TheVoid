const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    sessionType: {
      type: String,
      enum: ["focus", "short-break", "long-break"],
      default: "focus",
    },

    productivityScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },

    note: {
      type: String,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);