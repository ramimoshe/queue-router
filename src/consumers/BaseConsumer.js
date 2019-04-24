'use strict';

const EventEmitter = require('events');

class BaseConsumer extends EventEmitter {
    constructor() {
        super();
    }

    /* eslint no-unused-vars: 0 */
    createConsumer(handler, options) {
        throw new Error('Cannot create consumer from BaseConsumer');
    }
}

module.exports = BaseConsumer;
