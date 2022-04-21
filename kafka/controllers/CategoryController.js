const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')

exports.createCategory = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.CATEGORY_TOPIC, { ...req.body, action: actions.CREATE_CATEGORY }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.getAllCategories = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.CATEGORY_TOPIC, { ...req.body, action: actions.GET_ALL_CATEGORIES }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}