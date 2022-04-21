const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')

exports.placeOrder = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.ORDER_TOPIC, { ...req.body, action: actions.PLACE_ORDER }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.getAllOrders = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.ORDER_TOPIC, { ...req.body, query: req.query, action: actions.GET_ALL_ORDERS }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}