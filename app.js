const express = require("express");
const dbConfig = require("./config/database.config");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

mongoose.Promise = global.Promise;

const app = express();

const url = "mongodb://rajnikant:rajni123@ds243212.mlab.com:43212/medicine_db";
mongoose
  .connect(url)
  .then(() => console.log("Successfully connected to database"))
  .catch(err => {
    console.log("Could not connect to database...");
    process.exit();
  });

const medicineRouter = require("./app/routes/medicine.routes");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", medicineRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening at port ${port}...`));
