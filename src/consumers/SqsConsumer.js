'use strict';

const AWS          = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const BaseConsumer = require('./BaseConsumer');

/* Events:
error:              Fired on general errors.
message_error:      Fired when an error occurs processing the message.
message_received:   Fired when a message is received.
message_processed:  Fired when a message is successfully processed and removed from the queue.
stopped:            Fired when the consumer finally stops its work.
idle:               Fired when the queue is empty (All messages have been consumed).
 */

class SqsConsumer extends BaseConsumer {
    constructor(options) {
        super();

        AWS.config.update({
            region         : options.aws.credentials.region || process.env.AWS_REGION,
            accessKeyId    : options.aws.credentials.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: options.aws.credentials.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
        });

        this.batchSize = options.aws.batchSize || 10;
        this.sqsClient = options.aws.sqsClient;
        this.queueUrl  = options.aws.queueUrl;
    }

    createConsumer(handler) {
        return Consumer.create({
            queueUrl     : this.queueUrl,
            sqs          : this.sqsClient,
            handleMessage: async (message) => await handler(message.Body),
            batchSize    : this.batchSize
        }).on('error', error => this.emit('error', error))
            .on('timeout_error', error => this.emit('error', error))
            .on('processing_error', error => this.emit('message_error', error))
            .on('message_received', info => this.emit('message_received', info))
            .on('message_processed', info => this.emit('message_processed', info))
            .on('stopped', error => this.emit('stopped', error))
            .on('empty', error => this.emit('idle', error));
    }
}

module.exports = SqsConsumer;
