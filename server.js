const express = require("express");
const usersRouter = require("./src/routes/users");
const threadsRouter = require("./src/routes/threads");
const postsRouter = require("./src/routes/posts");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "form-api",
    status: "ok",
    description: "Forum monolith REST API",
    endpoints: {
      users: ["/users", "/users/:id"],
      threads: ["/threads", "/threads/:id"],
      posts: ["/posts", "/posts/:id"],
    },
  });
});

app.use("/users", usersRouter);
app.use("/threads", threadsRouter);
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
  console.log(`server is ready and listening on port ${port}`);
});

module.exports = app;
