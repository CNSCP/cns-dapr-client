// publish.js - CNS Dapr client example
// Copyright 2023 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const dapr = require('@dapr/dapr');
const env = require('dotenv').config();

// Errors

const E_CONTEXT = 'no context';
const E_BADREQUEST = 'bad request';

// Defaults

const defaults = {
  CNS_CONTEXT: '',
  CNS_DAPR_HOST: 'localhost',
  CNS_DAPR_PORT: '3500',
  CNS_PUBSUB: 'cns-pubsub'
};

// Config

const config = {
  CNS_CONTEXT: process.env.CNS_CONTEXT || defaults.CNS_CONTEXT,
  CNS_DAPR_HOST: process.env.CNS_DAPR_HOST || defaults.CNS_DAPR_HOST,
  CNS_DAPR_PORT: process.env.CNS_DAPR_PORT || defaults.CNS_DAPR_PORT,
  CNS_PUBSUB: process.env.CNS_PUBSUB || defaults.CNS_PUBSUB
};

// Dapr client

const client = new dapr.DaprClient({
  daprHost: config.CNS_DAPR_HOST,
  daprPort: config.CNS_DAPR_PORT,
  logger: {
    level: dapr.LogLevel.Error
  }
});

// Client application
async function start() {
  // No context?
  if (config.CNS_CONTEXT === '')
    throw new Error(E_CONTEXT);

  // Start client
  await client.start();

  // Publish to context
  const context = 'node/contexts/' + config.CNS_CONTEXT;

  try {
    // dapr publish --publish-app-id cns-dapr --pubsub cns-pubsub --topic node/contexts/$CNS_CONTEXT --data '{"title":"Testing"}'
    await client.pubsub.publish(
      config.CNS_PUBSUB,
      context,
      JSON.parse(process.argv[2]));
  } catch(e) {
    // Failure
    throw new Error(E_BADREQUEST);
  }

  // Display results
  console.log('Published:', context);
}

// Start application
start().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
