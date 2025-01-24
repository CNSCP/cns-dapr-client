// subscribe.js - CNS Dapr client example
// Copyright 2023 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const dapr = require('@dapr/dapr');
const env = require('dotenv').config();

// Errors

const E_CONTEXT = 'no context';

// Defaults

const defaults = {
  CNS_CONTEXT: '',
  CNS_DAPR_HOST: 'localhost',
  CNS_DAPR_PORT: '3500',
  CNS_PUBSUB: 'cns-pubsub',
  CNS_SERVER_HOST: 'localhost',
  CNS_SERVER_PORT: '3100'
};

// Config

const config = {
  CNS_CONTEXT: process.env.CNS_CONTEXT || defaults.CNS_CONTEXT,
  CNS_DAPR_HOST: process.env.CNS_DAPR_HOST || defaults.CNS_DAPR_HOST,
  CNS_DAPR_PORT: process.env.CNS_DAPR_PORT || defaults.CNS_DAPR_PORT,
  CNS_PUBSUB: process.env.CNS_PUBSUB || defaults.CNS_PUBSUB,
  CNS_SERVER_HOST: process.env.CNS_SERVER_HOST || defaults.CNS_SERVER_HOST,
  CNS_SERVER_PORT: process.env.CNS_SERVER_PORT || defaults.CNS_SERVER_PORT
};

// Dapr server

const server = new dapr.DaprServer({
  serverHost: config.CNS_SERVER_HOST,
  serverPort: config.CNS_SERVER_PORT,
  clientOptions: {
    daprHost: config.CNS_DAPR_HOST,
    daprPort: config.CND_DAPR_PORT
  },
  logger: {
    level: dapr.LogLevel.Error
  }
});

// Client application
async function start() {
  // No context?
  if (config.CNS_CONTEXT === '')
    throw new Error(E_CONTEXT);

  // Subscribe to context
  const context = 'node/contexts/' + config.CNS_CONTEXT;
  console.log('Subscribing:', context);

  server.pubsub.subscribe(config.CNS_PUBSUB, context, (data) => {
    console.log(context, '=', JSON.stringify(data, null, 2));
  });

  // Start server
  await server.start();
}

// Start application
start().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
