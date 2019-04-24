'use strict';

const Joi = require('joi');


class Router {
    constructor() {
        this._controllers = new Map();
    }

    get(type) {
        return this._controllers.get(type);
    }

    getRegisteredTypes() {
        return Array.from( this._controllers.keys());
    }

    add(type, config) {
        if (this._controllers.has(type)) {
            throw new Error(`The ${type} type already added`);
        }

        const validationResult = Joi.validate(config, Joi.object({
            handler   : Joi.func().arity(1).required(),
            validation: Joi.object({
                schema: Joi.object({
                    isJoi: Joi.valid(true).error(new Error('schema joi be Joi schema only'))
                }).unknown().default(Joi.any())
            })
        }));
        if (validationResult.error) {
            throw new Error(`invalid config object, error: ${validationResult.error}`);
        }

        this._controllers.set(type, config);
    }

    remove(type) {
        this._controllers.delete(type);
    }
}

module.exports = Router;
