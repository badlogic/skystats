import compression from "compression";
import express from "express";
import * as http from "http";
import cors from "cors";

const port = process.env.PORT ?? 3333;
const blueskyAccount = process.env.SKYSTATS_BLUESKY_ACCOUNT;
const blueskyKey = process.env.SKYSTATS_BLUESKY_PASSWORD;

if (!blueskyAccount || !blueskyKey) {
  console.error(
    "Please specify SKYSTATS_BLUESKY_ACCOUNT and SKYSTATS_BLUESKY_PASSWORD via env vars."
  );
  process.exit(-1);
}

console.log(`BlueSky account: ${blueskyAccount}`);
console.log(`BlueSky key: ${blueskyKey}`);

(async () => {
  const app = express();
  app.use(cors());
  app.use(compression());
  app.use(express.static("./"));

  http.createServer(app).listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
})();
