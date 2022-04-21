const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')

exports.addToCart = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.CART_TOPIC, { ...req.body, action: actions.ADD_TO_CART }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.removeFromCart = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.CART_TOPIC, { ...req.body, action: actions.REMOVE_FROM_CART }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.modifyCart = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.CART_TOPIC, { ...req.body, action: actions.MODIFY_CART }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.getCartDetails = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.CART_TOPIC, { ...req.body, action: actions.GET_CART_DETAILS }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}