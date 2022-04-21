const kafka = require('./../kafka/kafka')
const actions = require('../../util/kafkaActions.json')
const kafkaTopics = require('../../util/kafkaTopics.json')

exports.getAllFavourites = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.FAVOURITE_TOPIC, { ...req.body, action: actions.GET_ALL_FAVOURITES }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.modifyFavourite = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.FAVOURITE_TOPIC, { ...req.body, action: actions.ADD_OR_REMOVE_FAVOURITE }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}

exports.getFavouritesForMember = async (req, res) => {
    kafka.sendKafkaRequest(kafkaTopics.FAVOURITE_TOPIC, { ...req.body, action: actions.GET_FAVOURITES_FOR_MEMBER }, (err, data) => {
        if (err) return res.status(400).json(err)
        return res.json(data)
    })
}