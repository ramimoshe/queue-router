# queue-router
Simple Router For Queues

[![NPM version](https://img.shields.io/npm/v/queue-router.svg?style=flat)](https://npmjs.org/package/queue-router)
[![NPM Downloads](https://img.shields.io/npm/dm/queue-router.svg?style=flat)](https://npmjs.org/package/queue-router)
[![Node.js Version](https://img.shields.io/node/v/queue-router.svg?style=flat)](http://nodejs.org/download/)

[Full documentation](https://github.com/ramimoshe/queue-router/wiki/Getting-started)

### Message Format 
```js
{
   "type": "TYPE_1",
   "content": // your message, can be any type (object, string, init, ...)
}
```

 
### Usage

#### Create Router (Routes messages to specific handler)
```js
  const Router = require('queue-router').Router;
  const router = new Router();
  router.add('TYPE_1', {
      handler: function(messageContent, attributes) { // Required
          // your handling code
      },
      validation: { // Optional
          schema: // Joi schema, https://github.com/hapijs/joi 
      }
  });
```

#### Create Worker (Pulling message from queue and send them to the router)
```js
  const workerFactory = require('queue-router').workerFactory;
  const worker = workerFactory.create(workerFactory.Types.SQS, router, config);
  worker.init().then(() => worker.start());
```


### Configuration
  
##### SQS Config
``` js
{
   "queue": { // object, required
      "aws": { // object, required
         "credentials": { // object, optional
            "region": "", // string, optional, (default from env AWS_REGION)
            "accessKeyId": "", // string, optional, (default from env AWS_ACCESS_KEY_ID)
            "secretAccessKey": "", // string, optional, (default from env secretAccessKey)
         },
         "batchSize": "", //int, optional, (size of batch, default 10)
         "queueUrl": "", //string, required, (url to sqs)
}
```

### Worker Events
- error:              Fired on general errors.
- message_error:      Fired when an error occurs processing the message.
- message_received:   Fired when a message is received.
- message_processed:  Fired when a message is successfully processed and removed from the queue.
- stopped:            Fired when the consumer finally stops its work.
- idle:               Fired when the queue is empty (All messages have been consumed).


### Run Tests
```bash
npm test
```


### License
MIT
