// profile.js - CNS Dapr client example
// Copyright 2023 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const dapr = require('@dapr/dapr');

const env = require('dotenv').config();
const table = require('table');

// Errors

const E_PROFILE = 'no profile';
const E_BADREQUEST = 'bad request';

// Defaults

const defaults = {
  CNS_DAPR: 'cns-dapr',
  CNS_DAPR_HOST: 'localhost',
  CNS_DAPR_PORT: '3500'
};

// Config

const config = {
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
function display(data) {
  const m = [];
  const p = [];

  // Add metadata
  for (const name in data) {
    const value = data[name];

    if (typeof value !== 'object')
      m.push([name, value]);
  }

  // Add properties
  for (const name in data.properties) {
    const property = data.properties[name];

    const flags =
      (property.required?'R':'-') +
      (property.propagate?'P':'-');

    p.push([name, property.comment, flags]);
  }

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
        1: {width: 37, truncate: 37},
        2: {width: 2}
      },
      singleLine: true
    }).trim()]);
  }

  // Show definition
  console.log(table.table(m, {
    header: {content: 'Profile Definition', truncate: 76},
    columns: {
      0: {width: 16, truncate: 16},
      1: {width: 57, wrapWord: true}
    }
  }).trim());
}

// Client application
async function start() {
  // Start client
  await client.start();

  // Process command line
  const profile = process.argv[2] || '';

  if (profile === '')
    throw new Error(E_PROFILE);

  // Fetch profile
  var res;

  try {
    // dapr invoke --app-id cns-dapr --method profiles/cp:test.abc.v1 --verb GET
    res = await client.invoker.invoke(
      config.CNS_DAPR,
      'profiles/' + profile,
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
}

// Start application
start().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
