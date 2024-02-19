const express = require("express");
const router = express.Router();

const { getReferral, createReferral } = require("../controllers/referral");
const { getMarketData } = require("../controllers/market");

router.get("/referral", getReferral);
router.post("/referral", createReferral);

router.get("/market-data", getMarketData);

module.exports = router;
