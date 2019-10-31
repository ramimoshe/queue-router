/* eslint no-unused-vars:off */
'use strict';

const Promise      = require('bluebird');
const Joi          = require('joi');
const Worker       = require('../../../src/Worker');
const Router       = require('../../../src/Router');
const ConsumerMock = require('./mocks/Consumer');


test('start - 1 valid message and undefined atttributes with existing controller - should call TEST_CONTROLLER1 handler', async (done) => {
    const consumerStub    = new ConsumerMock();
    const expectedMessage = {
        type   : 'TEST_CONTROLLER1',
        content: {
            age: 19
        }
    };
    consumerStub.injectFakeResponseData([JSON.stringify(expectedMessage)]);
    const router = new Router();
    router.add('TEST_CONTROLLER1', {
        handler   : (msg, attributes) => {
            expect(msg).toEqual(expectedMessage.content);
            expect(attributes).toEqual(undefined);
            done();
        },
        validation: {
            schema: Joi.object({
                age: Joi.number()
            })
        }
    });
    const worker = new Worker(consumerStub, router).init();
    worker.start();
    await Promise.delay(100);
});

test('start - 1 valid message without existing controller - should not call TEST_CONTROLLER1 handler & emit error', async (done) => {
    const consumerStub    = new ConsumerMock();
    const expectedMessage = {
        type   : 'TEST_CONTROLLER1',
        content: {
            age: 19
        }
    };
    consumerStub.injectFakeResponseData([JSON.stringify(expectedMessage)]);
    const router = new Router();
    router.add('BLA', {
        handler: (msg, attributes) => {
            done('should not be called');
        }
    });
    const worker = new Worker(consumerStub, router).init();
    worker.on('error', () => {
        done();
    }).start();
    await Promise.delay(100);
});

test('start - 1 invalid message with existing controller - should not call TEST_CONTROLLER1 handler', async (done) => {
    const consumerStub    = new ConsumerMock();
    const expectedMessage = {
        type   : 'TEST_CONTROLLER1',
        content: {
            age: 19
        }
    };
    consumerStub.injectFakeResponseData([JSON.stringify(expectedMessage)]);
    const router = new Router();
    router.add('TEST_CONTROLLER1', {
        handler      : (msg, attributes) => {
            done('should not be called');
        }, validation: {
            schema: Joi.string()
        }
    });
    const worker = new Worker(consumerStub, router).init();
    worker.on('error', () => {
        done();
    }).start();
    await Promise.delay(100);
});

test('start - 1 valid message and atttributes array with existing controller - should call TEST_CONTROLLER1 handler', async (done) => {
    const consumerStub    = new ConsumerMock();
    const expectedMessage = {
        type   : 'TEST_CONTROLLER1',
        content: {
            age: 19
        }
    };

    var expectedMessageAttributes = {
        sender : {
            StringValue     : "test",
            StringListValues: [],
            BinaryListValues: [],
            DataType        : "String"
        },
        version: {
            StringValue     : "1",
            StringListValues: [],
            BinaryListValues: [],
            DataType        : "Number"
        }
    }

 

    consumerStub.injectFakeResponseData([JSON.stringify(expectedMessage)], expectedMessageAttributes);

    const router = new Router();
    router.add('TEST_CONTROLLER1', {
        handler      : (msg, attributes) => {
            expect(msg).toEqual(expectedMessage.content);
            expect(attributes).toEqual(expectedMessageAttributes.content);
            done();
        }, validation: {
            schema: Joi.object({
                age: Joi.number()
            })
        }
    });
    const worker = new Worker(consumerStub, router).init();
    worker.on('error', () => {
        done();
    }).start();
    await Promise.delay(100);
});