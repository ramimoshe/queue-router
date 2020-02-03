
const Joi = require('joi');


class Router {
    constructor(config) {
        this.trace = _.getOr(false, 'trace')(config);    
        this._controllers = new Map();
    }

    get(type) {
        return this._controllers.get(type);
    }

    getRegisteredTypes() {
        return Array.from(this._controllers.keys());
    }

    add(type, config) {
        if (this._controllers.has(type)) {
            throw new Error(`The ${type} type already added`);
        }

        const validationResult = Joi.validate(config, Joi.object({
            handler   : Joi.func().maxArity(2).required(),
            validation: Joi.object({
                schema: Joi.object({
                    isJoi: Joi.valid(true).error(new Error('schema joi can be Joi schema only'))
                }).unknown(),
            }).default({ schema: Joi.any() })
        }));
        if (validationResult.error) {
            throw new Error(`invalid config object, error: ${validationResult.error}`);
        }
        this._controllers.set(type, validationResult.value);
    }

    remove(type) {
        this._controllers.delete(type);
    }
}

module.exports = Router;
