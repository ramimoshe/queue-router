'use strict';

const EventEmitter = require('events');
const _            = require('lodash/fp');
const Joi          = require('joi');


const messageStatuses = {
    processing: 'PROCESSING',
    proceed   : 'PROCEED'
};


class Worker extends EventEmitter {
    constructor(consumer, router) {
        super();
        this._consumer = consumer;
        this.router = router;
    }

    get messageSchema() {
        return Joi.object({
            type   : Joi.any().valid(_.values([...this.router.getRegisteredTypes()])).required(),
            content: Joi.any().required()
        }).required().unknown(false);
    }

    init() {
        this._queue = this._consumer.createConsumer(this._handleMessage.bind(this));
        this._queue
            .on('error', error => this.emit('error', error))
            .on('message_error', error => this.emit('message_error', error))
            .on('message_received', info => this.emit('error', info))
            .on('message_processed', info => this.emit('error', info))
            .on('stopped', info => this.emit('error', info))
            .on('idle', info => this.emit('error', info));

        return this;
    }

    start() {
        this._queue.start();
    }

    stop() {
        this._queue.stop();
    }

    async _handleMessage(message) {
        try {
            const jsonMessage = JSON.parse(message);
            if (this._validateMessage(jsonMessage, this.messageSchema).error) return;

            const controller              = this.router.get(jsonMessage.type);
            const contentValidationResult = this._validateMessage(jsonMessage.content, controller.validation.schema);
            if (contentValidationResult.error) return;

            this.emit('message', { type: jsonMessage.type, status: messageStatuses.processing });
            await controller.handler(contentValidationResult.value);
            this.emit('message', { type: jsonMessage.type, status: messageStatuses.proceed });
        } catch (error) {
            this.emit('error', error);
        }
    }

    _validateMessage(message, schema) {
        const validationResult = Joi.validate(message, schema);
        if (validationResult.error) {
            this.emit('error', new Error(`Invalid message, error: ${validationResult.error}, message: ${JSON.stringify(message)}`));
        }

        return validationResult;
    }
}

module.exports = Worker;
