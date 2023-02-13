const express = require("express");
require("dotenv").config();
const app = express();
const {
  models: { User, Note },
} = require("./db");
const path = require("path");

// middleware
app.use(express.json());

const requireToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await User.byToken(token);
    req.user = data;
    next();
  } catch (err) {
    next(err);
  }
};

// routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", requireToken, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/notes", requireToken, async (req, res, next) => {
  try {
    const notes = await Note.findAll({ where: { userId: req.user.id } });
    res.send(notes);
  } catch (e) {
    next(e);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
