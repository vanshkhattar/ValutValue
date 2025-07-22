const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const ApiError = require("./utils/ApiError");
const ErrorHandling = require("./middlewares/ErrorHandler");

// ✅ Correct path - this line is critical!
const MLRoute = require("./routes/ml.route");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
const AuthRoute = require("./routes/auth.route");
app.use("/api/v1/auth", AuthRoute);


// ✅ Mount BEFORE the fallback
app.use("/api/v1/ml", MLRoute);

// ✅ Serve outputs
app.use("/api/v1/ml/spikes", express.static(path.join(__dirname, "..", "ml_backend", "outputs")));

const consumerRoutes = require("./routes/Consumer.route"); // ✅ make sure path is correct
app.use("/api/v1/consumer", consumerRoutes);

const orderRoutes = require("./routes/Order.route");
app.use("/api/v1/orders", orderRoutes);

app.use("/ml-outputs", express.static(path.join(__dirname, "..", "ml_backend", "outputs")));

// ❌ This must be the LAST route
app.use("*", (req, res) => {
  console.log("No match for:", req.originalUrl); // Add this debug line
  throw new ApiError(404, "page not found");
});

app.use(ErrorHandling);

module.exports = app;
