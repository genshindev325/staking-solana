const { Connection, PublicKey } = require("@solana/web3.js");
const axios = require("axios");
require("dotenv").config();

let tokenPrice = 0;
let tokenTotalSupply = 0;
let updatedTimeStamp = 0;
const PORK_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_PORK_MINT);

const reqURL =
  "https://api.coingecko.com/api/v3/coins/john-pork?localization=en&community_data=false&developer_data=false&sparkline=false";

const getMarketData = async (req, res) => {
  const currentTimeStamp = new Date().getTime();

  if (currentTimeStamp >= updatedTimeStamp + 1000 * 60) {
    const rpcURL = process.env.NEXT_PUBLIC_RPC;

    const connection = new Connection(rpcURL);

    const tokenSupply = await connection.getTokenSupply(PORK_TOKEN_ADDRESS);

    tokenTotalSupply = tokenSupply.value.uiAmount;

    updatedTimeStamp = currentTimeStamp;

    const { data } = await axios.get(reqURL);

    tokenPrice = data.market_data.current_price.usd;
  }

  res.json({ price: tokenPrice, supply: tokenTotalSupply });
};

const getReferral = async (req, res) => {
  const { ref } = req.query;

  const referrals = await ReferralModel.find({ referrer: ref });

  res.json({ referrals });
};

module.exports = {
  getMarketData,
};
