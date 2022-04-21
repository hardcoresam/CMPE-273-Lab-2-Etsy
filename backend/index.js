// import express module
const express = require('express');
// create an express app
const app = express();

require('dotenv').config();

// use body parser to parse JSON and urlencoded request bodies
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoDbUrl = "mongodb+srv://admin:passwordmongodb@cluster0.ssvve.mongodb.net/etsy?retryWrites=true&w=majority";
const mongoose = require('mongoose');

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

const kafkaConection = require('./kafka/KafkaConnect');
const kafkaTopics = require('../util/kafkaTopics.json');
const AuthService = require('./services/AuthService');
const CartService = require('./services/CartService');
const CategoryService = require('./services/CategoryService');
const FavouriteService = require('./services/FavouriteService');
const MemberService = require('./services/MemberService');
const OrderService = require('./services/OrderService');
const ProductService = require('./services/ProductService');
const ShopService = require('./services/ShopService');

function handleTopicRequest(topic_name, serviceObject) {
    kafkaConection.getConsumer(topic_name, (consumer) => {
        var producer = kafkaConection.getProducer()

        consumer.on('message', function (message) {
            var data = JSON.parse(message.value)
            const { payload, correlationId } = data
            console.log("1. Consumed Data at backend...")

            serviceObject.handle_request(payload, (err, res) => {
                let payload = {
                    correlationId: correlationId
                }
                if (err) {
                    console.log("Service failed with Error: ", err);
                    payload.status = 400;
                    payload.content = err;
                }

                if (res) {
                    payload.status = 200;
                    payload.content = res;
                }

                //Send Response to acknowledge topic
                let payloadForProducer = [
                    {
                        topic: kafkaTopics.ACKNOWLEDGE_TOPIC,
                        messages: JSON.stringify({ "acknowledgementpayload": true, payload }),
                        partition: 0
                    }
                ];
                producer.send(payloadForProducer, (err, data) => {
                    if (err) throw err
                    console.log("2. Sent Acknowledgement ...\n", data)
                })
            })
        })
    })
}

handleTopicRequest(kafkaTopics.AUTH_TOPIC, AuthService);
handleTopicRequest(kafkaTopics.CART_TOPIC, CartService);
handleTopicRequest(kafkaTopics.CATEGORY_TOPIC, CategoryService);
handleTopicRequest(kafkaTopics.FAVOURITE_TOPIC, FavouriteService);
handleTopicRequest(kafkaTopics.MEMBER_TOPIC, MemberService);
handleTopicRequest(kafkaTopics.ORDER_TOPIC, OrderService);
handleTopicRequest(kafkaTopics.PRODUCT_TOPIC, ProductService);
handleTopicRequest(kafkaTopics.SHOP_TOPIC, ShopService);

app.listen(8585, () => console.log('Backend Service listening on port 8585'));

module.exports = app;