const express = require("express");

const app = express()

const syncRoutes = require("./src/routes/sync.routes")

app.use("/base", syncRoutes)


app.listen(8000, () => {
    console.log("Listening on Port 8000")
})