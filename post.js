// post.js - CNS Dapr client example
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
  CNS_DAPR: 'cns-dapr',
  CNS_DAPR_HOST: 'localhost',
  CNS_DAPR_PORT: '3500'
};

// Config

const config = {
  CNS_CONTEXT: process.env.CNS_CONTEXT || defaults.CNS_CONTEXT,
  CNS_DAPR: process.env.CNS_DAPR || defaults.CNS_DAPR,
  CNS_DAPR_HOST: process.env.CNS_DAPR_HOST || defaults.CNS_DAPR_HOST,
  CNS_DAPR_PORT: process.env.CNS_DAPR_PORT || defaults.CNS_DAPR_PORT
};

// Dapr client

const client = new dapr.DaprClient({
  daprHost: config.CNS_DAPR_HOST,
  daprPort: config.CNS_DAPR_PORT,
  logger: {
    level: dapr.LogLevel.Error
  }
});

// Get invoke path
function location(path) {
  const home = 'node/contexts/' + config.CNS_CONTEXT;

  if (path.startsWith('~')) return home + path.substr(1);
  if (path.startsWith('/')) return path;

  return (path !== '')?(home + '/' + path):home;
}

// Client application
async function start() {
  // No context?
  if (config.CNS_CONTEXT === '')
    throw new Error(E_CONTEXT);

  // Start client
  await client.start();

  // Invoke request
  var res;

  try {
    // dapr invoke --app-id cns-dapr --method node/contexts/$CNS_CONTEXT --verb POST --data '{"title":"Testing"}'
    res = await client.invoker.invoke(
      config.CNS_DAPR,
      location(process.argv[2] || ''),
      dapr.HttpMethod.POST,
      JSON.parse(process.argv[3]));
  } catch(e) {
    // Failure
    throw new Error(E_BADREQUEST);
  }

  // Display results
  console.log(JSON.stringify(res, null, 2));
}

// Start application
start().catch((e) => {
  console.log(JSON.stringify({error: e.message}, null, 2));
  process.exit(1);
});
