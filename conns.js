// conns.js - CNS Dapr client example
// Copyright 2023 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const dapr = require('@dapr/dapr');

const env = require('dotenv').config();
const table = require('table');

// Errors

const E_CONTEXT = 'no context';
const E_CONNECTIONS = 'no connections';
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

// Display results
function display(data, pattern) {
  const c = [['Capability', 'Provider', 'Consumer', 'Status', 'Connection ID']];

  for (const name in data) {
    const cap = data[name];

    // Display connections
    for (const id in cap.connections) {
      const conn = cap.connections[id];

      // Filter by profile name
      if (pattern === undefined || match(name, '*' + pattern + '*'))
        c.push([name, conn.provider, conn.consumer, conn.status, id]);
    }
  }

  // None found?
  if (c.length <= 1)
    throw new Error(E_CONNECTIONS);

  // Display results
  console.log(table.table(c).trim());
}

// Wildcard match
function match(text, pattern) {
  const esc = (text) => text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  return new RegExp('^' + pattern.split('*').map(esc).join('.*') + '$').test(text);
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
    // dapr invoke --app-id cns-dapr --method node/contexts/$CNS_CONTEXT/capabilities --verb GET
    res = await client.invoker.invoke(
      config.CNS_DAPR,
      'node/contexts/' + config.CNS_CONTEXT + '/capabilities',
      dapr.HttpMethod.GET);
  } catch(e) {
    // Failure
    throw new Error(E_BADREQUEST);
  }

  // CNS Dapr error?
  if (res.error !== undefined)
    throw new Error(res.error);

  // Display results
  display(res.data, process.argv[2]);
}

// Start application
start().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
