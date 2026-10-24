const express = require("express");
const store = require("../store");

const router = express.Router();

router.get("/", (req, res) => {
  let result = [...store.posts.values()];
  if (req.query.threadId) {
    result = result.filter((p) => p.threadId === req.query.threadId);
  }
  if (req.query.userId) {
    result = result.filter((p) => p.userId === req.query.userId);
  }
  res.json(result);
});

router.post("/", (req, res) => {
  const { threadId, userId, body } = req.body || {};
  if (!threadId || !userId || !body) {
    return res.status(400).json({ error: "threadId, userId and body are required" });
  }
  if (store.validateRefs && !store.threads.has(threadId)) {
    return res.status(400).json({ error: "threadId does not exist" });
  }
  if (store.validateRefs && !store.users.has(userId)) {
    return res.status(400).json({ error: "userId does not exist" });
  }
  const post = { id: store.newId(), threadId, userId, body, createdAt: store.now() };
  store.posts.set(post.id, post);
  res.status(201).json(post);
});

router.get("/:id", (req, res) => {
  const post = store.posts.get(req.params.id);
  if (!post) return res.status(404).json({ error: "post not found" });
  res.json(post);
});

router.patch("/:id", (req, res) => {
  const post = store.posts.get(req.params.id);
  if (!post) return res.status(404).json({ error: "post not found" });
  const { body } = req.body || {};
  if (body !== undefined) post.body = body;
  res.json(post);
});

router.delete("/:id", (req, res) => {
  const post = store.posts.get(req.params.id);
  if (!post) return res.status(404).json({ error: "post not found" });
  store.posts.delete(post.id);
  res.status(204).end();
});

module.exports = router;
