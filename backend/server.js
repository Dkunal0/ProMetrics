const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "ProMetrics API" }));

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/prometrics")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= USER SCHEMA ================= */

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

/* ================= LOG SCHEMA ================= */

const logSchema = new mongoose.Schema({
  userId: String,

  date: String,
  category: String,
  hoursWorked: Number,
  tasksCompleted: Number,
  tasksPlanned: Number,
  focusHours: Number,
  meetingHours: Number,
  energy: String,
  productivity: Number,
  notes: String
});

const Log = mongoose.model("Log", logSchema);

/* ================= AUTH MIDDLEWARE ================= */

function auth(req, res, next) {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "No token"
    });
  }

  try {

    const verified = jwt.verify(token, process.env.JWT_SECRET || "SECRET123");

    req.user = verified;

    next();

  } catch (err) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
}

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({
      message: "Registration successful"
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        message: "Wrong password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET || "SECRET123"
    );

    res.json({
  token,
  name:user.name,
  message: "Login successful",
});

  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= SAVE LOG ================= */

app.post("/log", auth, async (req, res) => {

  try {

    const log = new Log({
      ...req.body,
      userId: req.user.id
    });

    await log.save();

    res.json({
      message: "Data saved successfully"
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= GET USER LOGS ================= */

app.get("/logs", auth, async (req, res) => {

  try {

    const logs = await Log.find({
      userId: req.user.id
    });

    res.json(logs);

  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});