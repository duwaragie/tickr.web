import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/auth", authRoutes);

// DB Connect & Server Start
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(process.env.PORT, () =>
//       console.log(`Server running on http://localhost:${process.env.PORT}`)
//     );
//   })
//   .catch(err => console.error("DB Connection Error:", err));
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});