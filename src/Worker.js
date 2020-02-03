'use strict';

const EventEmitter = require('events');
const _            = require('lodash/fp');
const Joi          = require('joi');
const Tracer = require('jaeger-tracer');
const { Tags, FORMAT_TEXT_MAP, globalTracer } = Tracer.opentracing;

const messageStatuses = {
    processing: 'PROCESSING',
    proceed   : 'PROCEED'
};


class Worker extends EventEmitter {
    constructor(consumer, router) {
        super();
        this._consumer = consumer;
        this.router = router;
        this.tracer = globalTracer();
    }

    get messageSchema() {
        return Joi.object({
            type   : Joi.any().valid(_.values([...this.router.getRegisteredTypes()])).required(),
            content: Joi.any().required()
        }).required().unknown(false);
    }

    init() {
        this._consumer.on('error', error => this.emit('error', error));
        this._queue = this._consumer.createConsumer(this._handleMessage.bind(this));
        this._queue
            .on('error', error => this.emit('error', error))
            .on('message_error', error => this.emit('message_error', error))
            .on('message_received', info => this.emit('message_received', info))
            .on('message_processed', info => this.emit('message_processed', info))
            .on('stopped', info => this.emit('stopped', info))
            .on('idle', info => this.emit('idle', info));

        return this;
    }

    start() {
        this._queue.start();
    }

    stop() {
        this._queue.stop();
    }

    startTrace(traceId){
        const carrier = {
            "uber-trace-id": traceId
        };
        let spanOptions =  {            
            tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_MESSAGING_CONSUMER }
        }

        if (traceId) {
            spanOptions.childOf = this.tracer.extract(FORMAT_TEXT_MAP, carrier);
        }

        return this.tracer.startSpan('handleMessage', spanOptions);
    }

    endTrace(span){
        if((span) && (span.finish instanceof Function)) span.finish();
    }

    logEvent(span, event, value) {
        if((!span) || (!span.log instanceof Function)) return;
        span.log({ event, value });
    }

    logError(span, errorObject, message, stack) {
        if((!span) || (!span.setTag instanceof Function)) return;
        span.setTag(Tags.ERROR, true);
        if(!span.log instanceof Function) return;
        span.log({ 'event': 'error', 'error.object': errorObject, 'message': message, 'stack': stack });
    }
    
    async _handleMessage(message, attributes) {
        let span = null;
        try {
            const jsonMessage = JSON.parse(message);
            if (this._validateMessage(jsonMessage, this.messageSchema).error) return;

            const controller              = this.router.get(jsonMessage.type);
            const contentValidationResult = this._validateMessage(jsonMessage.content, controller.validation.schema);
            if (contentValidationResult.error) return;

            this.emit('message', { type: jsonMessage.type, status: messageStatuses.processing });
            
            if(this.router.trace) {
                const traceId = _.getOr(null, 'traceId.StringValue')(attributes);
                span = this.startTrace(traceId);
                this.logEvent(span, 'handleMessage Request', { messageContent: jsonMessage, attributes });
            }
            await controller.handler(contentValidationResult.value, attributes, span);
            this.endTrace(span);
            this.emit('message', { type: jsonMessage.type, status: messageStatuses.proceed });
        
        } catch (error) {            
            this.logError(span, error, error.message, error.stack);
            this.endTrace(span);
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
