const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')
const { validationResult } = require('express-validator');

exports.getMemberDetails = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.MEMBER_TOPIC, { ...req.body, action: actions.GET_MEMBER }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.updateMemberCurrency = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.MEMBER_TOPIC, { ...req.body, action: actions.UPDATE_MEMBER_CURRENCY }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.editMemberDetails = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }

    kafka.sendKafkaRequest(kafkaTopics.MEMBER_TOPIC, { ...req.body, action: actions.EDIT_MEMBER_DETAILS }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}