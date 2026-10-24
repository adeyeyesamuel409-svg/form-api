const { randomUUID } = require("node:crypto");

const users = new Map();
const threads = new Map();
const posts = new Map();

function newId() {
  return randomUUID();
}

function now() {
  return new Date().toISOString();
}

const validateRefs = true;

module.exports = { users, threads, posts, newId, now, validateRefs };
