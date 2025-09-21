const express = require("express");
const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");
const SECRET = "mysecretkey";

const router = express.Router();

// Middleware
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ msg: "No token" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

// Add Expense
router.post("/", auth, async (req, res) => {
  const exp = new Expense({ user: req.userId, ...req.body });
  await exp.save();
  res.json(exp);
});

// View Expenses
router.get("/", auth, async (req, res) => {
  const expenses = await Expense.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(expenses);
});

// Edit Expense
router.put("/:id", auth, async (req, res) => {
  const exp = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );
  res.json(exp);
});

// Delete Expense
router.delete("/:id", auth, async (req, res) => {
  await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ msg: "Deleted" });
});

module.exports = router;
