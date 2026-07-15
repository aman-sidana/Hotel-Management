const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.URL)
  .then(() => {
    console.log("Database is Connected");
  })
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cors());

const UserRoute = require("./Router/UserRoute");
app.use("/user", UserRoute);

const StateRotue = require("./Router/StateRoute")
app.use('/state',StateRotue)

const DistrictRotue = require("./Router/DistrictRoute")
app.use('/district',DistrictRotue)

const CityRotue = require("./Router/CityRoute")
app.use('/city',CityRotue)

const HotelRoute = require("./Router/HotelRoute")
app.use('/hotel',HotelRoute)

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on Port : ${process.env.PORT}`);
});