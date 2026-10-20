const express = require("express");
const store = require("../store");

const router = express.Router();

router.get("/", (req, res) => {
  let result = [...store.threads.values()];
  if (req.query.userId) {
    result = result.filter((t) => t.userId === req.query.userId);
  }
  res.json(result);
});

router.post("/", (req, res) => {
  const { title, userId } = req.body || {};
  if (!title || !userId) {
    return res.status(400).json({ error: "title and userId are required" });
  }
  if (!store.users.has(userId)) {
    return res.status(400).json({ error: "userId does not exist" });
  }
  const thread = { id: store.newId(), title, userId, createdAt: store.now() };
  store.threads.set(thread.id, thread);
  res.status(201).json(thread);
});

router.get("/:id", (req, res) => {
  const thread = store.threads.get(req.params.id);
  if (!thread) return res.status(404).json({ error: "thread not found" });
  res.json(thread);
});

router.patch("/:id", (req, res) => {
  const thread = store.threads.get(req.params.id);
  if (!thread) return res.status(404).json({ error: "thread not found" });
  const { title } = req.body || {};
  if (title !== undefined) thread.title = title;
  res.json(thread);
});

router.delete("/:id", (req, res) => {
  const thread = store.threads.get(req.params.id);
  if (!thread) return res.status(404).json({ error: "thread not found" });
  for (const [postId, post] of store.posts) {
    if (post.threadId === thread.id) store.posts.delete(postId);
  }
  store.threads.delete(thread.id);
  res.status(204).end();
});

module.exports = router;
