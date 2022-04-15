// import express module
const express = require('express');
// create an express app
const app = express();
// require express middleware body-parser
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// specify the path of static directory
const path = require('path');

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Validation = require('./validations/Validation');
const { validationResult } = require('express-validator');
let passport = require("passport");
require('./config/passport')(passport)
//let checkAuth = passport.authenticate("jwt", { session: false });

const frontendUrl = "http://localhost:3000";

const mongoDbUrl = "mongodb+srv://admin:passwordmongodb@cluster0.ssvve.mongodb.net/etsy?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const Member = require("./models/Member");
const Shop = require("./models/Shop");
const Order = require("./models/Order");
const Product = require("./models/Product");
const Category = require("./models/Category");

var options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50
};

mongoose.connect(mongoDbUrl, options, (err, res) => {
  if (err) {
    console.log(err);
    console.log(`MongoDB Connection Failed`);
  } else {
    console.log(`MongoDB Connected`);
  }
});

//use cors to allow cross origin resource sharing
app.use(cors({ origin: frontendUrl, credentials: true }));

app.use(express.static(path.join(`${__dirname}/public`)));

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

const checkAuth = (req, res, next) => {
  next();
  return;
}
const checkAccessToken = (req, res, next) => {
  req.user = { id: '624f3fa0ea8c4261ac537c07' };
  next();
  return;
  // if (req.url.includes('/auth/')) {
  //   next();
  //   return;
  // }
  // if (!req.cookies['access-token']) {
  //   return res.status(500).json({ message: 'Unauthorized request sent' });
  // }
  // try {
  //   const decoded = jwt.verify(req.cookies['access-token'], process.env.JWT_SECRET_KEY);
  //   req.user = decoded.user;
  //   next();
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).json({ message: 'Unauthorized request sent' });
  // }
}

app.use(checkAccessToken);

app.post('/auth/login', Validation.loginValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { email, password } = req.body;
  const member = await Member.findOne({ email: email.toLowerCase() });
  if (member === null) {
    return res.status(400).json({ errors: { email: { msg: `Email ${email} is not registed with us` } } });
  }
  if (!bcrypt.compareSync(password, member.password)) {
    return res.status(400).json({ errors: { password: { msg: 'Incorrect password. Please try again!' } } });
  }

  const payload = { user: { id: member.id } };
  jwt.sign(payload, process.env.JWT_SECRET_KEY, (err, token) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.cookie('access-token', token, { maxAge: 900000, httpOnly: false });
    return res.status(200).json({ member: member, token: token });
  });
});

app.post('/auth/register', Validation.registrationValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { email, firstName, password } = req.body;
  const previousMember = await Member.findOne({ email: email.toLowerCase() });
  if (previousMember !== null) {
    return res.status(400).json({ errors: { email: { msg: `Email ${email} is already registered. Please login or use a different email` } } });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newMember = await new Member({
    email: email.toLowerCase(),
    password: hashedPassword,
    first_name: firstName
  }).save();

  const payload = { user: { id: newMember.id } };
  jwt.sign(payload, process.env.JWT_SECRET_KEY, (err, token) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.cookie('access-token', token, { maxAge: 900000, httpOnly: false, path: '/' });
    return res.status(200).json(newMember);
  });
});

app.post('/category', checkAuth, async (req, res) => {
  const category = await new Category({
    name: req.body.categoryName
  }).save();
  return res.status(200).json(category);
});

app.get('/categories', checkAuth, async (req, res) => {
  const categories = await Category.find({}).sort('_id');
  return res.status(200).json(categories);
});

app.get('/shop', checkAuth, async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user.id });
  return res.status(200).json(shop);
});

app.get('/shop/:shopId', checkAuth, async (req, res) => {
  const shopId = req.params.shopId;
  if (shopId.length !== 24) {
    return res.status(400).json({ error: "Invalid shop id specified" });
  }

  const shop = await Shop.findById(shopId).populate('owner', 'first_name photo phone_number').populate('products');
  if (shop === null) {
    return res.status(400).json({ error: "Invalid shop id specified" });
  }

  let shopTotalSales = 0;
  if (shop.products && shop.products.length > 0) {
    shop.products.forEach(product => {
      shopTotalSales = shopTotalSales + product.no_of_sales;
    });
  }

  const result = {
    shop: shop,
    is_owner: shop.owner.equals(req.user.id),
    shop_total_sales: shopTotalSales
  }
  return res.status(200).json(result);
});

app.post('/shop/available', checkAuth, Validation.checkShopNameValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const shop = await Shop.findOne({ name: req.body.shopName });
  return res.status(200).json({ available: shop === null });
});

app.post('/shop', checkAuth, async (req, res) => {
  const newShop = await new Shop({
    name: req.body.shopName,
    owner: req.user.id
  }).save();
  return res.status(200).json({ newShopId: newShop.id });
});

app.post('/shop/image', checkAuth, async (req, res) => {
  await Shop.findByIdAndUpdate({ _id: req.body.shopId }, { photo: req.body.shopImage });
  return res.status(200).json({ message: 'Shop Image edited successfully' });
});

app.post('/product', checkAuth, Validation.addProductValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const newProduct = await new Product({
    name: req.body.name,
    photo: req.body.photo,
    category: req.body.category,
    description: req.body.description,
    shop: req.body.shopId,
    price: req.body.price,
    quantity_available: req.body.quantityAvailable
  }).save();
  return res.status(200).json(newProduct);
});

app.post('/product/:productId', checkAuth, Validation.addProductValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const productId = req.params.productId;
  if (productId.length !== 24) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  const product = await Product.findById(productId);
  if (product === null) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  product.name = req.body.name;
  product.photo = req.body.photo;
  product.category = req.body.category;
  product.description = req.body.description;
  product.price = req.body.price;
  product.quantity_available = req.body.quantityAvailable;
  await product.save();
  return res.status(200).json({ message: 'Product update successfull' });
});

app.get('/product/:productId', checkAuth, async (req, res) => {
  const productId = req.params.productId;
  if (productId.length !== 24) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  const product = await Product.findById(productId).populate('shop').populate('category');
  if (product === null) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  const loggedInMember = await Member.findById(req.user.id).populate({
    path: 'favouriteProducts', match: { _id: { $eq: productId } }
  });
  const result = {
    product: product,
    is_favourited: loggedInMember.favouriteProducts.length !== 0,
  }
  return res.status(200).json(result);
});

app.get('/products', checkAuth, async (req, res) => {
  const products = await Product.find({});
  return res.status(200).json(products);
});

app.post('/products/filtered', checkAuth, async (req, res) => {
  let searchText = '.*' + req.body.searchedText + '.*';
  let findConditions = {
    name: {
      $regex: searchText,
      $options: 'i'
    }
  };

  if (req.body.excludeOutOfStockSql) {
    findConditions.quantity_available = {
      $gt: 0
    };
  }
  if (req.body.minPrice) {
    findConditions.price = {
      $gte: req.body.minPrice
    }
  }
  if (req.body.maxPrice) {
    if (findConditions.price) {
      findConditions.price.$lte = req.body.maxPrice
    } else {
      findConditions.price = {
        $lte: req.body.maxPrice
      }
    }
  }

  const filteredProducts = await Product.find(findConditions).sort(req.body.sortBy);
  return res.status(200).json(filteredProducts);
});

app.get('/favourites', checkAuth, async (req, res) => {
  const memberInfo = await Member.findById(req.user.id, 'favouriteProducts');
  return res.status(200).json(memberInfo.favouriteProducts);
});

app.post('/favourite', checkAuth, async (req, res) => {
  let updatedMemberInfo;
  const memberInfo = await Member.findById(req.user.id, 'favouriteProducts');

  if (!memberInfo.favouriteProducts.includes(req.body.productId)) {
    //Add a favourite
    updatedMemberInfo = await Member.findByIdAndUpdate({ _id: req.user.id }, { $push: { favouriteProducts: req.body.productId } }, { new: true });
  } else {
    //Remove from favourite
    updatedMemberInfo = await Member.findByIdAndUpdate({ _id: req.user.id }, { $pull: { favouriteProducts: req.body.productId } }, { new: true });
  }
  //Return the updated list of favourites
  return res.status(200).json(updatedMemberInfo.favouriteProducts);
});

app.get('/favourites-of-member', checkAuth, async (req, res) => {
  const favouritesInfo = await Member.findById(req.user.id, 'photo first_name favouriteProducts').populate('favouriteProducts');
  return res.status(200).json(favouritesInfo);
});

app.get('/member', checkAuth, async (req, res) => {
  const member = await Member.findById(req.user.id, '-cart -favouriteProducts');
  return res.status(200).json(member);
});

app.post('/member/currency', checkAuth, async (req, res) => {
  await Member.findByIdAndUpdate({ _id: req.user.id }, { currency: req.body.currency });
  return res.status(200).json({ message: 'User currency details updated' });
});

app.post('/member', checkAuth, Validation.updateMemberValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const member = await Member.findById(req.user.id);
  member.photo = req.body.photo;
  member.first_name = req.body.firstName;
  member.last_name = req.body.lastName;
  member.phone_number = req.body.phoneNumber;
  member.gender = req.body.gender;
  member.date_of_birth = req.body.birthday;
  member.about = req.body.about;
  member.address.street_address = req.body.streetAddress;
  member.address.apt_no = req.body.aptNo;
  member.address.zipcode = req.body.zipCode;
  member.address.city = req.body.city;
  member.address.state = req.body.state;
  member.address.country = req.body.country;
  await member.save();
  return res.status(200).json(member);
});

app.post('/cart/add', checkAuth, async (req, res) => {
  const member = await Member.findById(req.user.id, 'cart');
  let cartProductInfo;
  for (const cartProduct of member.cart) {
    if (cartProduct.product.equals(req.body.productId)) {
      cartProductInfo = cartProduct;
      break;
    }
  }
  if (cartProductInfo) {
    //Product already present in cart. Update quantity
    cartProductInfo.quantity = cartProductInfo.quantity + parseInt(req.body.quantity);
    await member.save();
  } else {
    //Add new product to cart
    await Member.findByIdAndUpdate({ _id: req.user.id }, { $push: { cart: { product: req.body.productId, quantity: req.body.quantity } } });
  }
  return res.status(200).json({ message: "Modified cart successfully" });
});

app.post('/cart/remove', checkAuth, async (req, res) => {
  await Member.updateOne({ _id: req.user.id }, { "$pull": { "cart": { "product": req.body.productId } } });

  const cartInfo = await Member.findById(req.user.id, 'cart').populate({
    path: 'cart.product',
    populate: 'shop'
  });
  return res.status(200).json(cartInfo);
});

app.post('/cart/modify', checkAuth, async (req, res) => {
  //TODO - Figure out why the below variable is not being used.
  let updateType = 'cart.$.' + req.body.updateType;
  const updatedCartInfo = await Member.select('cart').findOneAndUpdate({
    _id: req.user.id,
    cart: { '$elemMatch': { product: req.body.productId } }
  }, {
    $set: { updateType: req.body.updateValue }
  }, {
    new: true
  }).populate({
    path: 'cart.product',
    populate: 'shop'
  });
  return res.status(200).json(updatedCartInfo);
});

app.get('/cart', checkAuth, async (req, res) => {
  const cartInfo = await Member.findById(req.user.id, 'cart').populate({
    path: 'cart.product',
    populate: 'shop'
  });
  return res.status(200).json(cartInfo);
});

app.post('/order', checkAuth, async (req, res) => {
  //Check if address is present for this user before placing order
  const member = await Member.findById(req.user.id, 'cart address').populate('cart.product');
  if (!member.address || !member.address.street_address) {
    return res.status(401).json({
      error: "You have no saved address. Please go to your profile and save your address before placing an order."
    });
  }

  if (member.cart.length === 0) {
    return res.status(400).json({ error: "Invalid cart info. Cannot place order." });
  }

  //Check if products are available for the selected quantity before ordering
  for (const cartInfo of member.cart) {
    if (cartInfo.quantity > cartInfo.product.quantity_available) {
      return res.status(401).json({
        error: `${cartInfo.product.name} has ${cartInfo.product.quantity_available} items in stock. Please modify your quantity before placing an order`
      });
    }
  }

  const newOrder = new Order({ member: req.user.id, ordered_products: [] });

  member.cart.forEach(async (cartInfo) => {
    newOrder.ordered_products.push({
      product: cartInfo.product.id,
      quantity: cartInfo.quantity,
      price: cartInfo.product.price,
      gift_packing: cartInfo.gift_packing,
      note_to_seller: cartInfo.note_to_seller
    });
    //Changing the available quantity and no_of_sales for the products
    await Product.findByIdAndUpdate({ _id: cartInfo.product.id }, {
      quantity_available: cartInfo.product.quantity_available - cartInfo.quantity,
      $inc: {
        no_of_sales: cartInfo.quantity
      }
    });
  });
  await newOrder.save();

  //Deleting all the products from cart once order is placed successfully
  member.cart = [];
  await member.save();
  return res.status(200).json({ message: "Order placed successfully" });
});

app.get('/orders', checkAuth, async (req, res) => {
  const orders = await Order.find({ member: req.user.id }).populate({
    path: 'ordered_products.product',
    populate: 'shop'
  });
  return res.status(200).json(orders);
});

app.listen(4000, () => console.log('Server listening on port 4000'));

module.exports = app;