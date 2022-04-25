var kafka = require('kafka-node')

exports.getProducer = () => {
    var client = new kafka.KafkaClient("54.183.218.17:2181")
    var HighLevelProducer = kafka.HighLevelProducer;
    return new HighLevelProducer(client)
}

exports.getConsumer = (topicName) => {
    console.log(topicName)
    var client = new kafka.KafkaClient("54.183.218.17:2181")
    var Consumer = kafka.Consumer
    var kafkaConsumer = new Consumer(client, [
        { topic: topicName, partition: 0 }
    ])
    return kafkaConsumer
}