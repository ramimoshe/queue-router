'use strict';

const Worker = require('./Worker');

const Types = Object.freeze({
    SQS: 'SQS'
});

function create(type, router, options = {}) {
    switch (type) {
        case Types.SQS: {
            const SqsConsumer = require('./consumers/SqsConsumer');
            const sqsConsumer = new SqsConsumer(options.queue);
            return new Worker(sqsConsumer, router, options.queue).init();
        }
        default: {
            throw new Error('Unsupported type');
        }
    }
}

module.exports = {
    create: create,
    Types: Types
};
