'use strict';

const _ = require('lodash/fp');
const EventEmitter = require('events');


class ConsumerStub {
    constructor() {
        this.injectedData = [];
        this.queueNumber  = 0;
    }

    createConsumer(handler) {
        const csr = new ConsumerStubRunner(handler);
        csr.injectFakeResponseData(this.injectedData[this.queueNumber++]);

        return csr;
    }

    injectFakeResponseData(arrayData) {
        this.injectedData.push(arrayData);
    }
}

class ConsumerStubRunner extends EventEmitter{
    constructor(handler) {
        super();
        this.handler = handler;
    }

    injectFakeResponseData(arrayData) {
        this.arrayData = arrayData;
    }

    start() {
        try {
            _.each((data) => {
                this.handler(data, () => {
                });
            })(this.arrayData);
        }
        catch (err) {
            console.log(err);
        }
    }
}

module.exports = ConsumerStub;
