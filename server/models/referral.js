const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema(
  {
    referrer: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      require: true,
    },
    amount: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const ReferralModel = mongoose.model("Referral", ReferralSchema);

module.exports = ReferralModel;
