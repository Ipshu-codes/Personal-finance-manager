const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Personal Finance Manager API" });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});