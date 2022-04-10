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

const frontendUrl = "http://localhost:3000";

const mongoDbUrl = "mongodb+srv://admin:passwordmongodb@cluster0.ssvve.mongodb.net/etsy?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const { Member, Shop, Order, Product, Category } = require("./models");

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

const checkAccessToken = (req, res, next) => {
  if (req.url.includes('/auth/')) {
    next();
    return;
  }
  if (!req.cookies['access-token']) {
    return res.status(500).json({ message: 'Unauthorized request sent' });
  }
  try {
    const decoded = jwt.verify(req.cookies['access-token'], process.env.JWT_SECRET_KEY);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unauthorized request sent' });
  }
}

//app.use(checkAccessToken);

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

app.post('/category', async (req, res) => {
  const category = await new Category({
    name: req.body.categoryName
  }).save();
  return res.status(200).json(category);
});

app.get('/categories', async (req, res) => {
  const categories = await Category.find({}).sort('_id');
  return res.status(200).json(categories);
});

app.get('/shop', async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user.id });
  return res.status(200).json(shop);
});

app.get('/shop/:shopId', async (req, res) => {
  const shopId = req.params.shopId;
  if (shopId.length !== 24) {
    return res.status(400).json({ error: "Invalid shop id specified" });
  }

  const shop = await Shop.findById(shopId).populate('owner', 'first_name photo phone_number').populate('products');
  if (shop === null) {
    return res.status(400).json({ error: "Invalid shop id specified" });
  }

  // const totalSales = await sequelize.query('select sum(op.quantity) as total_sales from product p inner join order_product op on p.id = op.product_id where p.shop_id = :shop_id', {
  //   replacements: { shop_id: shopId },
  //   type: Sequelize.QueryTypes.SELECT
  // });
  // shop.setDataValue('total_sales', totalSales[0].total_sales);

  const result = {
    shop: shop,
    is_owner: shop.owner === req.user.id,
    //TODO - Change this
    total_sales: 1
  }
  return res.status(200).json(result);
});

app.post('/shop/available', Validation.checkShopNameValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const shop = await Shop.findOne({ name: req.body.shopName });
  return res.status(200).json({ available: shop === null });
});

app.post('/shop', async (req, res) => {
  const newShop = await new Shop({
    name: req.body.shopName,
    owner: req.user.id
  }).save();
  return res.status(200).json({ newShopId: newShop.id });
});

app.post('/shop/image', async (req, res) => {
  await Shop.findByIdAndUpdate({ _id: req.body.shopId }, { photo: req.body.shopImage });
  return res.status(200).json({ message: 'Shop Image edited successfully' });
});

app.post('/product', Validation.addProductValidation(), async (req, res) => {
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

app.post('/product/:productId', Validation.addProductValidation(), async (req, res) => {
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

app.get('/product/:productId', async (req, res) => {
  const productId = req.params.productId;
  if (productId.length !== 24) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  const product = await Product.findById(productId).populate('shop').populate('category');
  if (product === null) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  // const totalSales = await sequelize.query('select sum(op.quantity) as total_sales from product p inner join order_product op on p.id = op.product_id where p.id = :product_id', {
  //   replacements: { product_id: product.id },
  //   type: Sequelize.QueryTypes.SELECT
  // });
  // product.setDataValue('shop_total_sales', totalSales[0].total_sales);

  const loggedInMember = await Member.findById(req.user.id).populate({
    path: 'favouriteProducts', match: { _id: { $eq: productId } }
  });

  console.log(loggedInMember);

  const result = {
    product: product,
    is_favourited: loggedInMember.favouriteProducts.length !== 0,
    //TODO - Need to change this
    shop_total_sales: 1
  }
  return res.status(200).json(result);
});

app.get('/products', async (req, res) => {
  const products = await Product.find({});
  return res.status(200).json(products);
});

//TODO - This is pending
app.post('/products/filtered', async (req, res) => {
  let sql = "select p.*, IFNULL(sum(op.quantity), 0) as total_sales from product p left join order_product op on p.id = op.product_id ";
  let searchTextSql = "where p.name like :searchedText ";
  let excludeOutOfStockSql = "and p.quantity_available > 0 "
  let minPriceFilter = "and p.price >= :minPrice ";
  let maxPriceFilter = "and p.price <= :maxPrice ";
  let groupBySql = "group by p.id "
  let sortBySql = "order by ";

  let replacements = {};
  sql = sql + searchTextSql;
  replacements.searchedText = '%' + req.body.searchedText + '%';

  if (req.body.excludeOutOfStockSql) {
    sql = sql + excludeOutOfStockSql;
  }
  if (req.body.minPrice) {
    sql = sql + minPriceFilter;
    replacements.minPrice = req.body.minPrice;
  }
  if (req.body.maxPrice) {
    sql = sql + maxPriceFilter;
    replacements.maxPrice = req.body.maxPrice;
  }
  sql = sql + groupBySql;
  sql = sql + sortBySql + req.body.sortBy;

  // const filteredProducts = await sequelize.query(sql, {
  //   replacements: replacements,
  //   type: Sequelize.QueryTypes.SELECT
  // });
  return res.status(200).json(filteredProducts);
});

app.get('/favourites', async (req, res) => {
  const memberInfo = await Member.findById(req.user.id, 'favouriteProducts');
  return res.status(200).json(memberInfo.favouriteProducts);
});

app.post('/favourite', async (req, res) => {
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

app.get('/favourites-of-member', async (req, res) => {
  const favouritesInfo = await Member.findById(req.user.id, 'photo first_name favouriteProducts').populate('favouriteProducts');
  return res.status(200).json(favouritesInfo);
});

app.get('/member', async (req, res) => {
  const member = await Member.findById(req.user.id, '-cart -favouriteProducts');
  return res.status(200).json(member);
});

app.post('/member/currency', async (req, res) => {
  await Member.findByIdAndUpdate({ _id: req.user.id }, { currency: req.body.currency });
  return res.status(200).json({ message: 'User currency details updated' });
});

app.post('/member', Validation.updateMemberValidation(), async (req, res) => {
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

app.post('/cart/add', async (req, res) => {
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

app.post('/cart/remove', async (req, res) => {
  await Member.updateOne({ _id: req.user.id }, { "$pull": { "cart": { "product": req.body.productId } } });

  const cartInfo = await Member.findById(req.user.id, 'cart').populate({
    path: 'cart.product',
    populate: 'shop'
  });
  return res.status(200).json(cartInfo);
});

app.get('/cart', async (req, res) => {
  const cartInfo = await Member.findById(req.user.id, 'cart').populate({
    path: 'cart.product',
    populate: 'shop'
  });
  return res.status(200).json(cartInfo);
});

app.post('/order', async (req, res) => {
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
      price: cartInfo.product.price
    });
    //Changing the available quantity for the products
    await Product.findByIdAndUpdate({ _id: cartInfo.product.id }, { quantity_available: cartInfo.product.quantity_available - cartInfo.quantity });
  });
  await newOrder.save();

  //Deleting all the products from cart once order is placed successfully
  member.cart = [];
  await member.save();
  return res.status(200).json({ message: "Order placed successfully" });
});

app.get('/orders', async (req, res) => {
  const orders = await Order.find({ member: req.user.id }).populate({
    path: 'ordered_products.product',
    populate: 'shop'
  });
  return res.status(200).json(orders);
});

//TODO - See this and use this whereever required
//https://mongoosejs.com/docs/populate.html#populate-virtuals

app.listen(4000, () => console.log('Server listening on port 4000'));

module.exports = app;