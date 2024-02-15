const { connect, connection } = require("mongoose");
require('dotenv').config();

// --- DB Connection

const connectDB = () => {
  const url = process.env.MONGODB_URI;

  try {
    connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = connection;

  dbConnection.once("open", (_) => {
    console.log(`Database connected: ${url}`);
  });

  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
};

module.exports = connectDB;
