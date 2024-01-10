# CNS-Dapr Client Examples

## Table of Contents

- [About](#about)
- [Installing](#installing)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [License](#license)
- [Copyright Notice](#copyright-notice)

## About

This repository contains various examples that talk to the CNS Dapr Sidecar, written in [Node.js](https://nodejs.org/en/about) and using the [Dapr SDK](https://docs.dapr.io/developing-applications/sdks/js/). The examples are used in conjunction with CNS Dapr and it is assumed this is already installed and running (See the [CNS Dapr](https://github.com/CNSCP/cns-dapr) repository for details).

The examples demonstrate the services provided by CNS Dapr.

## Installing

To **install** or **update** the application, you should fetch the latest version from this Git repository. To do that, you may either download and unpack the repo zip file, or clone the repo using:

```sh
git clone https://github.com/cnscp/cns-dapr-client.git
```

Either method should get you a copy of the latest version. It is recommended (but not compulsory) to place the repo in the `~/cns-dapr-client` project directory. Go to the project directory and install Node.js dependancies with:

```sh
npm install
```

Your application should now be ready to rock.

## Usage

Once installed, run the application with:

```sh
npm run start
```

To shut down the application, hit `ctrl-c`.

### Environment Variables

The example uses the following environment variables to configure itself:

| Variable         | Description                      | Default                |
|------------------|----------------------------------|------------------------|
| CNS_SERVER_HOST  | CNS Example server host          | 'localhost'            |
| CNS_SERVER_PORT  | CNS Example server port          | '3100'                 |
| CNS_DAPR_HOST    | Dapr host                        | 'localhost'            |
| CNS_DAPR_PORT    | Dapr port                        | '3500'                 |
| CNS_DAPR         | CNS Dapr application ID          | 'cns-dapr'             |
| CNS_PUBSUB       | CNS Dapr PUBSUB component ID     | 'cns-pubsub'           |
| CNS_CONTEXT      | CNS Dapr context                 | Must be set            |

#### Linux

| Command                              | Description                           |
|--------------------------------------|---------------------------------------|
| env                                  | List all variables                    |
| export [name]=[value]                | Set variable                          |
| unset [name]                         | Remove variable                       |

#### Windows

| Command                              | Description                           |
|--------------------------------------|---------------------------------------|
| set                                  | List all variables                    |
| set [name]=[value]                   | Set variable                          |
| set [name]=                          | Remove variable                       |

### Walkthrough

The main example code is held in `index.js` and uses the Dapr SDK to communicate with the CNS Dapr Sidecar. The SDK is included near the top of the file with the line:

```
const dapr = require('@dapr/dapr');
```

The Dapr SDK exposes two object classes: `DaprClient` and `DaprServer`. The client allows you to communicate with a Dapr Sidecar and access its client facing features, while the server allows you to receive communication from a Dapr Sidecar and access its server facing features.

Now the example creates an instance of both `client` and `server` objects using the values held in the environment variables outlined above. These values should have been set before running the app (or you may use the defaults).

```
const client = new dapr.DaprClient({ ... });
const server = new dapr.DaprServer({ ... });
```

Skipping to the bottom of the file, you should see the `start` function. This is called when the application starts up. The first thing it does is to start the DaprClient created previously.

```
await client.start();
```

Once the client is started, it invokes a `GET /<context>` request to the CNS Dapr Sidecar. Any communication error thrown by the Dapr SDK is also caught and displayed.

```
res = await client.invoker.invoke(CNS_DAPR, CNS_CONTEXT, dapr.HttpMethod.GET);
```

Now it checks the response from CNS Dapr for errors.

```
if (res.error !== undefined)
```

If CNS Dapr does not understand or cannot fulfil the request, it is sets the `error` property of the response to a string indicating the error that occurred. If no error exists, it passes the response `data` property to the `display` function:

```
display(res.data);
```

For a full rundown of methods and what is returned in the `data` object, see the [CNS Dapr](https://github.com/CNSCP/cns-dapr) documentation. Essentially, it is all information about the context and its connections that CNS Dapr is configured for.

Now the example sets up a subscription to CNS Dapr, listening for changes to the context topic. When changes arrive, these also get sent to the `display` function.

```
server.pubsub.subscribe(CNS_PUBSUB, CNS_CONTEXT, display);
```

Once the subscription has been setup, the application starts the DaprServer.

```
await server.start();
```

The example now sits displaying context topic changes until the application is closed with `ctrl-c`.

### Other Examples

| Example                        | Description                | Source         |
|--------------------------------|----------------------------|----------------|
| npm run start                  | Main example application   | index.js       |
| npm run get [method]           | Invoke a GET method        | get.js         |
| npm run post [method] [data]   | Invoke a POST method       | post.js        |
| npm run publish [topic] [data] | Publish to a topic         | publish.js     |
| npm run subscribe [topic]      | Subscribe to a topic       | subscribe.js   |
| npm run list [profile] [role]  | List active connections    | list.js        |
| npm run profile [profile]      | Display profile metadata   | profile.js     |

## Maintainers

## License

See [LICENSE.md](./LICENSE.md).

## Copyright Notice

See [COPYRIGHT.md](./COPYRIGHT.md).
