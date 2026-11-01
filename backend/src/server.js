require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`GadgetCrate API berjalan di port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Gagal menghubungkan MongoDB:", error.message);
    process.exit(1);
  });