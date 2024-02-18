const express = require("express");
const router = express.Router();

const { getReferral, createReferral } = require("../controllers/referral");

router.get("/referral", getReferral);
router.post("/referral", createReferral);

module.exports = router;
