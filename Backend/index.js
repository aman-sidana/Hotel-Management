const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const fileUpload = require("express-fileupload");


const app = express();

mongoose
  .connect(process.env.URL)
  .then(() => {
    console.log("Database is Connected");
  })
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cors());
app.use(fileUpload())

const UserRoute = require("./Router/UserRoute");
app.use("/user", UserRoute);

const StateRotue = require("./Router/StateRoute")
app.use('/state', StateRotue)

const DistrictRotue = require("./Router/DistrictRoute")
app.use('/district', DistrictRotue)

const CityRotue = require("./Router/CityRoute")
app.use('/city', CityRotue)

const HotelRoute = require("./Router/HotelRoute")
app.use('/hotel', HotelRoute)

const AdminRoute = require("./Router/AdminRoute")
app.use('/admin',AdminRoute)

const CouponRoute = require("./Router/CouponRoute")
app.use('/coupon',CouponRoute)

const roomRoutes = require("./Router/RoomRoute"); 

app.use("/room", roomRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on Port : ${process.env.PORT}`);
});