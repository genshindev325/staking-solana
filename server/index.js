// ------------------------- Express Server -----------------------//

const express = require("express");
const app_server = express();
const bodyParser = require("body-parser");
const { createServer } = require("https");
const { readFileSync } = require("fs");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

connectDB();

app_server.use(bodyParser.json());
app_server.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app_server.use(cors());
app_server.use(express.static("public"));

const privateKey = readFileSync(`secrets/pork_staking.pem`, "utf8");
const certificate = readFileSync(`secrets/pork_staking.crt`, "utf8");
const caRoot = readFileSync(`secrets/pork_staking_root.crt`, "utf8");
const caBundle = readFileSync(`secrets/pork_staking_bundle.crt`, "utf8");

const expressHttpsServer = createServer(
  {
    key: privateKey,
    cert: certificate,
    ca: [caRoot, caBundle],
  },
  app_server
);

expressHttpsServer.listen(8081, function () {
  const port = expressHttpsServer.address().port;
  console.log(`>>>>>>>>>> Node Server listening at port ${port} <<<<<<<<<<`);
});

// ------------------------ Next.js Server --------------------------//

const { parse } = require("url");
const next = require("next");

const port = 443;
const dev = process.env.NODE_ENV == "development" ? true : false;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsServer = createServer(
  {
    key: privateKey,
    cert: certificate,
    ca: [caRoot, caBundle],
  },
  (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }
);


app.prepare().then(() => {
  httpsServer.listen(port);

  console.log(
    `>>>>>>>>>> Next ${
      dev ? "Development" : "Production"
    } Server listening at port ${port} <<<<<<<<<<`
  );
});
