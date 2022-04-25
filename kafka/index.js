// import express module
const express = require('express');
// create an express app
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();
let passport = require("passport");
require('./config/passport')(passport)

const PORT = process.env.PORT || 4000

const frontendUrl = "http://54.183.218.17:3000";

//use cors to allow cross origin resource sharing
app.use(cors({ origin: frontendUrl, credentials: true }));

// use body parser to parse JSON and urlencoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use cookie parser to parse request headers
app.use(cookieParser());

//Allow Access Control
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', frontendUrl);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

//Defining Routes
app.use('/auth', require('./routes/AuthRoute'));
app.use('/category', require('./routes/CategoryRoute'));
app.use('/shop', require('./routes/ShopRoute'));
app.use('/product', require('./routes/ProductRoute'));
app.use('/favourite', require('./routes/FavouriteRoute'));
app.use('/member', require('./routes/MemberRoute'));
app.use('/cart', require('./routes/CartRoute'));
app.use('/order', require('./routes/OrderRoute'));

app.listen(PORT, () => console.log('Kafka Service listening on port - ', PORT));

module.exports = app;