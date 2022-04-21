const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')
const { validationResult } = require('express-validator');

exports.getShop = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.SHOP_TOPIC, { ...req.body, action: actions.GET_SHOP }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.getShopById = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.SHOP_TOPIC, { ...req.body, params: req.params, action: actions.GET_SHOP_BY_ID }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.checkShopNameAvailability = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }

    kafka.sendKafkaRequest(kafkaTopics.SHOP_TOPIC, { ...req.body, action: actions.CHECK_SHOP_IF_AVAILABLE }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.createShop = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.SHOP_TOPIC, { ...req.body, action: actions.CREATE_SHOP }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.changeShopImage = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.SHOP_TOPIC, { ...req.body, action: actions.CHANGE_SHOP_IMAGE }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}