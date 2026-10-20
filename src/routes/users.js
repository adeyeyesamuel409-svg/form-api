const express = require("express");
const store = require("../store");

const router = express.Router();

router.get("/", (req, res) => {
  res.json([...store.users.values()]);
});

router.post("/", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const user = { id: store.newId(), name, email, createdAt: store.now() };
  store.users.set(user.id, user);
  res.status(201).json(user);
});

router.get("/:id", (req, res) => {
  const user = store.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "user not found" });
  res.json(user);
});

router.patch("/:id", (req, res) => {
  const user = store.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "user not found" });
  const { name, email } = req.body || {};
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  res.json(user);
});

router.delete("/:id", (req, res) => {
  const user = store.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "user not found" });

  for (const [threadId, thread] of store.threads) {
    if (thread.userId === user.id) {
      store.threads.delete(threadId);
      for (const [postId, post] of store.posts) {
        if (post.threadId === threadId) store.posts.delete(postId);
      }
    }
  }
  for (const [postId, post] of store.posts) {
    if (post.userId === user.id) store.posts.delete(postId);
  }
  store.users.delete(user.id);
  res.status(204).end();
});

module.exports = router;
