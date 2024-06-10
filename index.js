// index.js - CNS Dapr client example
// Copyright 2023 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const dapr = require('@dapr/dapr');

const env = require('dotenv').config();
const table = require('table');

// Errors

const E_CONTEXT = 'no context';
const E_BADREQUEST = 'bad request';

// Defaults

const defaults = {
  CNS_CONTEXT: '',
  CNS_DAPR: 'cns-dapr',
  CNS_DAPR_HOST: 'localhost',
  CNS_DAPR_PORT: '3500',
  CNS_PUBSUB: 'cns-pubsub',
  CNS_SERVER_HOST: 'localhost',
  CNS_SERVER_PORT: '3100'
};

// Config

const config = {
  CNS_CONTEXT: process.env.CNS_CONTEXT || defaults.CNS_CONTEXT,
  CNS_DAPR: process.env.CNS_DAPR || defaults.CNS_DAPR,
  CNS_DAPR_HOST: process.env.CNS_DAPR_HOST || defaults.CNS_DAPR_HOST,
  CNS_DAPR_PORT: process.env.CNS_DAPR_PORT || defaults.CNS_DAPR_PORT,
  CNS_PUBSUB: process.env.CNS_PUBSUB || defaults.CNS_PUBSUB,
  CNS_SERVER_HOST: process.env.CNS_SERVER_HOST || defaults.CNS_SERVER_HOST,
  CNS_SERVER_PORT: process.env.CNS_SERVER_PORT || defaults.CNS_SERVER_PORT
};

// Dapr client

const client = new dapr.DaprClient({
  daprHost: config.CNS_DAPR_HOST,
  daprPort: config.CNS_DAPR_PORT,
  logger: {
    level: dapr.LogLevel.Error
  }
});

// Dapr server

const server = new dapr.DaprServer({
  serverHost: config.CNS_SERVER_HOST,
  serverPort: config.CNS_SERVER_PORT,
  clientOptions: {
    daprHost: config.CNS_DAPR_HOST,
    daprPort: config.CNS_DAPR_PORT
  },
  logger: {
    level: dapr.LogLevel.Error
  }
});

// Local data

var updates = 0;

// Display results
function display(data) {
  // Show update number
  if (updates > 0)
    console.log(table.table([['Update #' + updates]]).trim());

  updates++;

  // Show context changes
  const m = metadata(data);

  if (m.length > 0) {
    console.log(table.table(m, {
      header: {content: 'Context ' + config.CNS_CONTEXT, truncate: 76},
      columns: {
        0: {width: 16, truncate: 16},
        1: {width: 57, wrapWord: true}
      }
    }).trim());
  }

  // Display capabilities
  list('Capability', data.capabilities);
}

// Display list
function list(type, data) {
  // Show list changes
  for (const name in data) {
    const o = data[name];

    // Was it removed?
    if (o === null) {
      console.log(table.table([[type + ' ' + name + ' removed']]).trim());
      continue;
    }

    // Show metadata and properties
    const m = metadata(o);
    const p = [];

    for (const name in o.properties)
      p.push([name, o.properties[name]]);

    if (p.length > 0) {
      // Combine properties
      m.push(['properties', table.table(p, {
        border: table.getBorderCharacters('void'),
        columnDefault: {
          paddingLeft: 0,
          paddingRight: 1
        },
        columns: {
          0: {width: 16, truncate: 16},
          1: {width: 41, truncate: 41}
        },
        singleLine: true
      }).trim()]);
    }

    if (m.length > 0) {
      // Show list
      console.log(table.table(m, {
        header: {content: type + ' ' + name, truncate: 76},
        columns: {
          0: {width: 16, truncate: 16},
          1: {width: 57, wrapWord: true}
        }
      }).trim());
    }

    // Display connections
    if (o.connections !== undefined)
      list('Connection', o.connections);
  }
}

// Create metadata table
function metadata(data) {
  const t = [];

  for (const name in data) {
    const value = data[name];

    if (typeof value !== 'object')
      t.push([name, value]);
  }
  return t;
}

// Client application
async function start() {
  // No context?
  if (config.CNS_CONTEXT === '')
    throw new Error(E_CONTEXT);

  // Start client
  await client.start();

  // Fetch current
  const context = 'node/contexts/' + config.CNS_CONTEXT;
  var res;

  try {
    res = await client.invoker.invoke(
      config.CNS_DAPR,
      context,
      dapr.HttpMethod.GET);
  } catch(e) {
    // Failure
    throw new Error(E_BADREQUEST);
  }

  // CNS Dapr error?
  if (res.error !== undefined)
    throw new Error(res.error);

  // Display results
  display(res.data);

  // Subscribe to topic
  console.log(table.table([['Subscribing to ' + context]]).trim());

  server.pubsub.subscribe(
    config.CNS_PUBSUB,
    context,
    display);

  // Start server
  await server.start();
}

// Start application
start().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
