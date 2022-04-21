const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')
const { validationResult } = require('express-validator');

exports.createProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }
    kafka.sendKafkaRequest(kafkaTopics.PRODUCT_TOPIC, { ...req.body, action: actions.CREATE_PRODUCT }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.editProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }
    kafka.sendKafkaRequest(kafkaTopics.PRODUCT_TOPIC, { ...req.body, params: req.params, action: actions.EDIT_PRODUCT }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.getProductById = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.PRODUCT_TOPIC, { ...req.body, params: req.params, action: actions.GET_PRODUCT_BY_ID }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.getAllProducts = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.PRODUCT_TOPIC, { ...req.body, action: actions.GET_ALL_PRODUCTS }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.filterProducts = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.PRODUCT_TOPIC, { ...req.body, action: actions.FILTER_PRODUCTS }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}