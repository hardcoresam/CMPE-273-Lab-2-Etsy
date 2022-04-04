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
const { Member, Shop, Order, Product, Cart, CartProduct, Favourite, Category } = require("./models");
const { sequelize, Sequelize } = require("./models/index");

const frontendUrl = "http://localhost:3000";

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

app.use(checkAccessToken);

app.post('/auth/login', Validation.loginValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { email, password } = req.body;
  const member = await Member.findOne({
    where: sequelize.where(sequelize.fn('lower', Sequelize.col('email')), email.toLowerCase())
  });
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
  const previousMember = await Member.findOne({
    where: sequelize.where(sequelize.fn('lower', Sequelize.col('email')), email.toLowerCase())
  });
  if (previousMember !== null) {
    return res.status(400).json({ errors: { email: { msg: `Email ${email} is already registered. Please login or use a different email` } } });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newMember = await Member.create({
    email: email, password: hashedPassword, first_name: firstName
  });
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

app.get('/categories', async (req, res) => {
  const categories = await Category.findAll({ order: [['id', 'ASC']] });
  return res.status(200).json(categories);
});

app.get('/shop', async (req, res) => {
  const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
  return res.status(200).json(shop);
});

app.get('/shop/:shopId', async (req, res) => {
  const shopId = req.params.shopId;
  const shop = await Shop.findOne({
    where: { id: shopId }, include: [
      {
        model: Member,
        required: true
      },
      {
        model: Product
      }
    ]
  });

  if (shop === null) {
    return res.status(400).json({ error: "Invalid shop id specified" });
  }

  shop.setDataValue('is_owner', shop.owner_id === req.user.id);

  const totalSales = await sequelize.query('select sum(op.quantity) as total_sales from product p inner join order_product op on p.id = op.product_id where p.shop_id = :shop_id', {
    replacements: { shop_id: shopId },
    type: Sequelize.QueryTypes.SELECT
  });
  shop.setDataValue('total_sales', totalSales[0].total_sales);

  return res.status(200).json(shop);
});

app.post('/shop/available', Validation.checkShopNameValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const shop = await Shop.findOne({ where: { name: req.body.shopName } });
  return res.status(200).json({ available: shop === null });
});

app.post('/shop', async (req, res) => {
  const newShop = await Shop.create({
    name: req.body.shopName, owner_id: req.user.id
  });
  return res.status(200).json({ newShopId: newShop.id });
});

app.post('/shop/image', async (req, res) => {
  const shop = await Shop.findOne({ where: { id: req.body.shopId } });
  shop.set({
    photo: req.body.shopImage
  });
  await shop.save();
  return res.status(200).json({ message: 'Shop Image edited successfully' });
});

app.post('/product', Validation.addProductValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const newProduct = await Product.create({
    name: req.body.name,
    photo: req.body.photo,
    category_id: req.body.category,
    description: req.body.description,
    shop_id: req.body.shopId,
    price: req.body.price,
    quantity_available: req.body.quantityAvailable
  });
  return res.status(200).json(newProduct);
});

app.post('/product/:productId', Validation.addProductValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const product = await Product.findOne({ where: { id: req.params.productId } });
  if (product === null) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  product.set({
    name: req.body.name,
    photo: req.body.photo,
    category_id: req.body.category,
    description: req.body.description,
    price: req.body.price,
    quantity_available: req.body.quantityAvailable
  });
  await product.save();
  return res.status(200).json({ message: 'Product update successfull' });
});

app.get('/product/:productId', async (req, res) => {
  const product = await Product.findOne({
    where: { id: req.params.productId }, include: {
      model: Shop,
      required: true
    }
  });

  if (product === null) {
    return res.status(400).json({ error: "Invalid product id specified" });
  }

  const totalSales = await sequelize.query('select sum(op.quantity) as total_sales from product p inner join order_product op on p.id = op.product_id where p.id = :product_id', {
    replacements: { product_id: product.id },
    type: Sequelize.QueryTypes.SELECT
  });
  product.setDataValue('shop_total_sales', totalSales[0].total_sales);

  const favourite = await Favourite.findOne({ where: { member_id: req.user.id, product_id: req.params.productId } });
  product.setDataValue('is_favourited', favourite !== null);
  return res.status(200).json(product);
});

app.get('/products', async (req, res) => {
  const products = await Product.findAll();
  return res.status(200).json(products);
});

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

  const filteredProducts = await sequelize.query(sql, {
    replacements: replacements,
    type: Sequelize.QueryTypes.SELECT
  });
  return res.status(200).json(filteredProducts);
});

app.post('/category', async (req, res) => {
  const category = await Category.create({
    name: req.body.categoryName
  });
  return res.status(200).json(category);
});

app.get('/favourites', async (req, res) => {
  const favourites = await Favourite.findAll({ where: { member_id: req.user.id }, attributes: ['product_id'] });
  let favouritedProductIds = [];
  favourites.forEach((favourite) => {
    favouritedProductIds.push(favourite.product_id);
  });
  return res.status(200).json(favouritedProductIds);
});

app.post('/favourite', async (req, res) => {
  const favourite = await Favourite.findOne({ where: { member_id: req.user.id, product_id: req.body.productId } });
  if (favourite === null) {
    //Add a favourite
    await Favourite.create({
      member_id: req.user.id,
      product_id: req.body.productId
    });
  } else {
    //Remove from favourite
    await Favourite.destroy({ where: { id: favourite.id } });
  }
  //Return the updated list of favourites
  const favourites = await Favourite.findAll({ where: { member_id: req.user.id }, attributes: ['product_id'] });
  let favouritedProductIds = [];
  favourites.forEach((favourite) => {
    favouritedProductIds.push(favourite.product_id);
  });
  return res.status(200).json(favouritedProductIds);
});

app.get('/favourites-of-member', async (req, res) => {
  const favourites = await Favourite.findAll({
    where: { member_id: req.user.id },
    include: {
      model: Product,
      required: true
    }
  });
  const member = await Member.findOne({ where: { id: req.user.id } });
  const response = {
    favourites: favourites,
    memberInfo: {
      photo: member.photo,
      userName: member.first_name
    }
  }
  return res.status(200).json(response);
});

app.get('/member', async (req, res) => {
  const member = await Member.findOne({ where: { id: req.user.id } });
  return res.status(200).json(member);
});

app.post('/member/currency', async (req, res) => {
  const member = await Member.findOne({ where: { id: req.user.id } });
  member.set({ currency: req.body.currency });
  await member.save();
  return res.status(200).json(member);
});

app.post('/member', Validation.updateMemberValidation(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const member = await Member.findOne({ where: { id: req.user.id } });
  member.set({
    photo: req.body.photo,
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    phone_number: req.body.phoneNumber,
    gender: req.body.gender,
    date_of_birth: req.body.birthday,
    about: req.body.about,
    street_address: req.body.streetAddress,
    apt_no: req.body.aptNo,
    zipcode: req.body.zipCode,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country
  });
  await member.save();
  return res.status(200).json(member);
});

app.post('/cart/add', async (req, res) => {
  let cart = await Cart.findOne({ where: { member_id: req.user.id } });
  if (cart === null) {
    cart = await Cart.create({
      member_id: req.user.id
    });
  }
  let cartProduct = await CartProduct.findOne({ where: { cart_id: cart.id, product_id: req.body.productId } });
  if (cartProduct === null) {
    cartProduct = await CartProduct.create({
      cart_id: cart.id,
      product_id: req.body.productId,
      quantity: req.body.quantity
    });
  } else {
    cartProduct.set({
      quantity: cartProduct.quantity + parseInt(req.body.quantity)
    });
    await cartProduct.save();
  }
  return res.status(200).json(cartProduct);
});

app.post('/cart/remove', async (req, res) => {
  let cart = await Cart.findOne({ where: { member_id: req.user.id } });
  if (cart === null) {
    return res.status(400).json({ error: "No cart present for this member" });
  }
  let cartProduct = await CartProduct.findOne({ where: { cart_id: cart.id, product_id: req.body.productId } });
  if (cartProduct === null) {
    return res.status(400).json({ error: "This product isn't there inside this member's cart" });
  } else {
    await CartProduct.destroy({ where: { cart_id: cart.id, product_id: req.body.productId } });
    const cartData = await Cart.findOne({
      where: { member_id: req.user.id }, include: {
        model: Product,
        include: [Shop],
        required: true
      }
    });
    return res.status(200).json(cartData);
  }
});

app.get('/cart', async (req, res) => {
  const cart = await Cart.findOne({
    where: { member_id: req.user.id }, include: {
      model: Product,
      include: [Shop],
      required: true
    }
  });
  return res.status(200).json(cart);
});

app.post('/order', async (req, res) => {
  //Check if address is present for this user before placing order
  const member = await Member.findOne({ where: { id: req.user.id } });
  if (!member.street_address) {
    return res.status(401).json({
      error: "You have no saved address. Please go to your profile and save your address before placing an order."
    });
  }

  const cartInfo = await Cart.findOne({
    where: { member_id: req.user.id }, include: {
      model: Product,
      required: true
    }
  });
  if (cartInfo === null || cartInfo.Products.length === 0) {
    return res.status(400).json({ error: "Invalid cart info. Cannot place order." });
  }
  //Check if products are available for the selected quantity before ordering
  for (const product of cartInfo.Products) {
    let productFromDb = await Product.findOne({ where: { id: product.id } });
    if (product.CartProduct.quantity > productFromDb.quantity_available) {
      return res.status(401).json({
        error: `${product.name} has ${productFromDb.quantity_available} items in stock. Please modify your quantity before placing an order`
      });
    }
  }

  const order = await Order.create({
    member_id: req.user.id
  });
  cartInfo.Products.forEach(async (product) => {
    let productFromDb = await Product.findOne({ where: { id: product.id } });
    order.addProduct(productFromDb, { through: { quantity: product.CartProduct.quantity, price: product.price } });
    //Changing the available quantity for the products
    productFromDb.set({ quantity_available: productFromDb.quantity_available - product.CartProduct.quantity });
    await productFromDb.save();
  });

  //Deleting all the products from cart once order is placed successfully
  await CartProduct.destroy({ where: { cart_id: cartInfo.id } });
  return res.status(200).json({ message: "Order placed successfully" });
});

app.get('/orders', async (req, res) => {
  const orders = await Order.findAll({
    where: { member_id: req.user.id }, include: {
      model: Product,
      include: [Shop],
      required: true
    }
  });
  return res.status(200).json(orders);
});

app.listen(4000, () => console.log('Server listening on port 4000'));

module.exports = app;