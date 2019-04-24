# queue-router
simple router for queues

[![NPM version](https://img.shields.io/npm/v/queue-router.svg?style=flat)](https://npmjs.org/package/queue-router)
[![NPM Downloads](https://img.shields.io/npm/dm/queue-router.svg?style=flat)](https://npmjs.org/package/queue-router)
[![Node.js Version](https://img.shields.io/node/v/queue-router.svg?style=flat)](http://nodejs.org/download/)


### SQS Message Format 
```json
{
   "type": "TYPE_1",
   "content": { /* your message */ }
}
```

 
### Usage

```js
  const routerFactory = require('queue-router').routerFactory;

  const router = new routerFactory.create(config);
  router.add('TYPE_1', {
      handler: function(messageContent) {
          // your handling code
      }
  })
  router
    .on('error', console.error)
    .start();
```


### Configuration
  - queue
    - type: type of the queue, SQS is the only supported query right now (default SQS)
    - config
      - aws
        - credentials
          - region: (default from env AWS_REGION)
          - accessKeyId: (default from env AWS_ACCESS_KEY_ID)
          - secretAccessKey: (default from env AWS_SECRET_ACCESS_KEY)
        - batchSize: Size of batch (default 10)

### Events
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
