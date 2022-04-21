const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')
const { validationResult } = require('express-validator');

exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }
    kafka.sendKafkaRequest(kafkaTopics.AUTH_TOPIC, { ...req.body, action: actions.REGISTER_USER }, (err, data) => {
        if (err) return res.status(400).json(err)
        //res.cookie('access-token', data.token, { maxAge: 9000000, httpOnly: false });
        return res.json(data)
    })
}

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }
    kafka.sendKafkaRequest(kafkaTopics.AUTH_TOPIC, { ...req.body, action: actions.LOGIN }, (err, data) => {
        if (err) return res.status(400).json(err)
        res.cookie('access-token', data.token, { maxAge: 9000000, httpOnly: false });
        return res.json(data)
    })
}