'use strict';

const _            = require('lodash/fp');
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

    on() {
    }

    injectFakeResponseData(msg, attributes) {
        this.injectedData.push({
            msg,
            attributes: attributes
        });
    }
}

class ConsumerStubRunner extends EventEmitter {
    constructor(handler) {
        super();
        this.handler = handler;
    }

    injectFakeResponseData(data) {
        this.data = data;
    }

    start() {
        try {
            _.each((msg) => {
                    const attributes = _.get('attributes')(this.data); //_.getOr(undefined ,'attributes')(this.data)
                    this.handler(msg, attributes, () => {
                });
            })(this.data.msg);


        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = ConsumerStub;
