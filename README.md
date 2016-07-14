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

| Name                 | Type                                                    | Description                     |
|:-------------------- |:------------------------------------------------------- |:------------------------------- |
| app                  | `Express`                                               | **Required** - The express app. |
| supervisorConnection | [`ConnectionObject`](#markdown-header-connectionobject) | **Required** - The connection details of the Supervisor. |
| monitorConnection    | [`ConnectionObject`](#markdown-header-connectionobject) | **Optional** - The connection details of the Monitor. In case of missing, the [Reporter](#markdown-header-3-reporter) component will be disabled. |

#### ConnectionObject:

| Name                 | Type             | Description           |
|:-------------------- |:---------------- |:--------------------- |
| host                 | `string`         | Host url.             |
| port                 | `integer`        | Port number.          |
| username             | `string`         | Credentials username. |
| password             | `string`         | Credentials password. |

**Example:**

```
var app = express();

var supervisorConnection = {
    url: 'http://supervisor.oai.governify.io/api/v1',
    port: 80,
    username: 'marck',
	password: 'm4321'
};

slaManager.register(app, supervisorConnection);
```

## 2. Scope Resolver

### configure
Use this method to set the configuration parameters of the Scope Resolver.

#### Configuration parameters:

| Name                 | Type                                                                  | Description          |
|:-------------------- |:--------------------------------------------------------------------- |:-------------------- |
| defaultOAuthProvider | `string`                                                              | The default provider when **aouthprovider** is missing in the request header. |
| config               | [`<provider, OauthConfigObject>`](#markdown-header-oauthconfigobject) | Oauth provider configurations. |

#### OauthConfigObject:

| Name         | Type          | Description          |
|:------------ |:------------- |:-------------------- |
| clientId     | `string`      | The provider application id. |
| clientSecret | `string`      | The provider application secret. |
| callbackURL  | `string`      | The callback registered in the provider application. |

**Example:**

```
var options = {
	defaultOAuthProvider: 'google',
    config: {
        google: {
	        clientId: '6076-d1m.apps.googleusercontent.com',
            clientSecret: '1lWx9DDDaPo9kxF4yu6t_loJ',
            callbackURL: 'https://app.myservice.com/google/callback'
        }
    }
};
slaManager.scopeResolver.configure(options);
```

### getAccountName
Use this method to get the account name from the OAuth provider by the specified token.

**Example:**

```
slaManager.scopeResolver.getAccountName(oauthProvider, token, function (err, accountName) {
    // get accountName
});
```

### getAccountScope
Using this method to get the scope object from the supervisor by the specifying the apikey or the account name.

**Example:**

```
slaManager.scopeResolver.getAccountScope('apikey', 'NbfiS7wjwjwb=', function (err, result) {
	// get result.scope
});
//or
slaManager.scopeResolver.getAccountScope('account', 'john@tenant.com', function (err, result) {
	// get result.scope
});
```

### OAuth Providers
Using the powerful PassportJS framework and family of plugins **SLA4OAI** can be configured to support the following providers:
- [Google](https://console.developers.google.com)
- [Facebook](https://developers.facebook.com)
- [WindowsLive](https://account.live.com/developers/applications/index)
- [Github](https://github.com/settings/developers)