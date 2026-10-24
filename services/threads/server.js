const express = require("express");
const store = require("../../src/store");
const threadsRouter = require("../../src/routes/threads");

store.validateRefs = false;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.set("X-Service", "threads-service");
  next();
});

app.get("/", (req, res) => {
  res.json({ service: "threads-service", status: "ok" });
});

app.use("/threads", threadsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "route not found" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "invalid JSON body" });
  }
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`threads-service is ready and listening on port ${port}`);
});
