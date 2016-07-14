# SLA4OAI (SLA for Open API Initiative) Library
**SLA4OAI** is an open source library for applying SLA in your node application.

**SLA4OAI** is [Express](http://expressjs.com/)-compatible SLA Checking and Monitoring middleware for [Node.js](http://nodejs.org/).

**SLA4OAI** is based on [SLA for Open API Initiative Specification](https://bitbucket.org/sla4oai/sla4aoi-spec/src/ae4fc1de50f6a2d32d059bb605779b309d1decec/SLA4OAI-spec.md?fileviewer=file-view-default).
And follows the [Basic SLA Managment Service](https://bitbucket.org/sla4oai/sla4aoi-spec/src/ae4fc1de50f6a2d32d059bb605779b309d1decec/operationalServices.md?fileviewer=file-view-default) proposal.

## Install

```
$ npm install sla4aoi
```

## Basic Usage
You can simply use the library by registering it with the Express app and backend connections for Supervisor & Monitor:

```
var app = express();

var supervisorConnection = {
    url: 'http://supervisor.oai.governify.io/api/v1'
};

var monitorConnection = {
    url: 'http://monitor.oai.governify.io/api/v1'
};

slaManager.register(app, supervisorConnection, monitorConnection);
```

## API Reference
## 1. SlaManager

### register
Register all library components as express middlewares. Called once when the server getting up.

#### Parameters:

| Name                 | Type             | Description                     |
|:-------------------- |:---------------- |:------------------------------- |
| app                  | `Express`          | **Required** - The express app. |
| supervisorConnection | [`ConnectionObject`](#markdown-header-connectionobject) | **Required** - The connection details of the Supervisor |
| monitorConnection    | [`ConnectionObject`](#markdown-header-connectionobject) | **Optional** - The connection details of the Monitor. In case of missing, the [Reporter](#markdown-header-3-reporter) component will be disabled. |

#### ConnectionObject:

| Name                 | Type             | Description          |
|:-------------------- |:---------------- |:-------------------- |
| host                 | `string`         | Host url.            |
| port                 | `integer`        | Port number.         |
| username             | `string`         | Credentials username.|
| password             | `string`         | Credentials password.|
