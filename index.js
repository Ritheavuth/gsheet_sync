const express = require("express");

const app = express();
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch").default;
const config = require("./src/config/airtable.config");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const timestampFilePath = path.join(__dirname, "lastSyncTimestamp.txt");

function readLastSyncTimestamp() {
  try {
    const timestamp = fs.readFileSync(timestampFilePath, "utf8");
    return parseInt(timestamp);
  } catch (error) {
    return 0;
  }
}

function writeLastSyncTimestamp(timestamp) {
  fs.writeFileSync(timestampFilePath, timestamp.toString(), "utf8");
}

app.listen(8000, () => {
  console.log("Listening on Port 8000");
});

const synchronizeRecords = require("./src/routes/sync.routes");

setInterval(async () => {
  const response = await fetch(
    `https://api.airtable.com/v0/bases/${config.BASE_ID}/webhooks/${config.WEBHOOK_ID}/payloads`,
    {
      headers: {
        Authorization: `Bearer ${config.APIKEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    const payloads = data.payloads;
    const arrayTimestamp = payloads.map((obj) => obj["timestamp"]);
    const latestTimestamp = new Date(
      Math.max(...arrayTimestamp.map((timestamp) => new Date(timestamp)))
    );
    const check = latestTimestamp <= readLastSyncTimestamp;
    if (check) {
      return;
    } else {
      synchronizeRecords();
      writeLastSyncTimestamp(latestTimestamp);
    }
  }
}, 2000);
