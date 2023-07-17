const express = require("express");
const router = express.Router();
const { createSync, listSync } = require("../services/pg.services");

router.get("/tables", async (req, res) => {
    try {
        const syncs = await listSync();
        res.json(syncs);
      } catch (err) {
        res.status(500).json({ error: "Failed to retrieve syncs" });
      }
})

router.get("/syncs", async (req, res) => {
  try {
    const syncs = await listSync();
    res.json(syncs);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve syncs" });
  }
});

module.exports = router