/* eslint no-unused-vars:off */
'use strict';

const Router = require('../../../src/Router');


test('add - router contains 0 registered types - should add new type', async () => {
    const router       = new Router();
    const routerConfig = {
        handler: msg => {
        }
    };
    router.add('TEST_ROUTE_1', routerConfig);

    expect(router.get('TEST_ROUTE_1').handler).toEqual(routerConfig.handler);
});

test('add - trying to add route without handler - should throw Error', (done) => {
    const router       = new Router();
    const routerConfig = {};
    try {
        router.add('TEST_ROUTE_1', routerConfig);
    } catch (error) {
        done();
    }
});

test('add - trying to add route twice - should throw Error', (done) => {
    const router       = new Router();
    const routerConfig = {
        handler: msg => {
        }
    };
    router.add('TEST_ROUTE_1', routerConfig);

    try {
        router.add('TEST_ROUTE_1', routerConfig);
    } catch (error) {
        expect(error.message).toEqual('The TEST_ROUTE_1 type already added');
        return done();
    }

    done('test did not throw error');
});

test('keys - router contains 1 registered types - should return 1 type', async () => {
    const router       = new Router();
    const routerConfig = {
        handler: msg => {
        }
    };
    router.add('TEST_ROUTE_1', routerConfig);

    expect(router.getRegisteredTypes()).toEqual(['TEST_ROUTE_1']);
});
