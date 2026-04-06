const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const auditSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    method: { type: String, required: true },
    route: { type: String, required: true },
    ip: { type: String, required: true },
    device: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Audit", auditSchema);
