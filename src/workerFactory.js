'use strict';

const Worker = require('./Worker');

function create(type, router, options = {}) {
    switch (type) {
        case 'SQS': {
            const SqsConsumer = require('./src/consumers/SqsConsumer');
            const sqsConsumer = new SqsConsumer(options.queue);
            return new Worker(sqsConsumer, router).init();
        }
        default: {
            throw new Error('Unsupported type');
        }
    }
}

module.exports = {
    create: create
};
