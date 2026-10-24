const express = require("express");
const store = require("../../src/store");
const postsRouter = require("../../src/routes/posts");

store.validateRefs = false;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.set("X-Service", "posts-service");
  next();
});

app.get("/", (req, res) => {
  res.json({ service: "posts-service", status: "ok" });
});

app.use("/posts", postsRouter);

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
  console.log(`posts-service is ready and listening on port ${port}`);
});
