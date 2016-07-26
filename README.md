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

## 3. Bouncer

### configure
Use this method to set the configuration parameters of the Bouncer.

#### Configuration parameters:

| Name            | Type        | Description          |
|:--------------- |:----------- |:-------------------- |
| environment     | `string`    | The deploying environment (devel, qa, or production). |

**Example:**

```
var options = {
	environment: 'qa'
};
slaManager.bouncer.configure(options);
```

### needChecking
By default all incoming requests are verified by SLA Check, but you can customize this behaviour and specify which requests need checking.

**Example:**

```
slaManager.bouncer.needChecking = function(req) {
    if (startsWith(req.originalUrl, '/api/')) {    
        return true;
    }
    return false;
}
```

### decline
By default, bouncer declines all not accepted requested with status code `403` and the body that cames from the Supervisor. But you can customize the decline response message.

**Example:**

```
slaManager.bouncer.decline = function(req, res, next, supervisorPayload) {
    if(supervisorPayload.reason === 'Too many requests') {
        res.status(429).json(supervisorPayload.reason).end();
    }
    else {
        res.status(403).json(supervisorPayload).end();
    }
}
```

## 3. Reporter

### configure
Use this method to set the configuration parameters of the Reporter.

#### Configuration parameters:

| Name              | Type        | Description          |
|:----------------- |:----------- |:-------------------- |
| autoReport        | `boolean`   | In case of `true`, all API calls will be reported one by one, else the developer can aggregate multiple API calls in one report (default = true). |
| aggregate         | `boolean`   | Aggregate multiple measures in one report, this aggregated measures will be frequently sended based on the `aggregationPeriod` (default = false). *This features is disabled if the autoReport = false*. |
| aggregationPeriod | `double`    | All requests during this period will be aggregated in one report. It is calculated in milliseconds. |
| cluster           | `string`    | The cluster that process this API. |
| environment       | `string`    | The deploying environment (devel, qa, or production). |

**Example:**

```
var options = {
	autoReport: true,
	aggregate: true,
	aggregationPeriod: 100,
	cluster: 'cl1.acme.com',
    environment: 'qa'
};

slaManager.reporter.configure(options);
```

### reportMetrics
In case of `autoReport=false`, the developer will have the responsibility to call this method to report the aggregated metrics.

**Example:**

```
slaManager.reporter.reportMetrics();
```

### setMetric
At any stage of the api logic, the developer can set a custom metric by simply passing its name and value.

**Example:**

```
slaManager.reporter.setMetric(req, 'animalTypes', records.length);
```

### preCalculateMetrics
This method enables the developer to set the metrics that need to be calculated **before** the API logic.

**Example:**

```
slaManager.reporter.preCalculateMetrics = function(requestedMetrics, req, next) {
    req.sla.metrics['x-origin'] = req.headers['origin'];
    next();
};
```

### postCalculateMetrics
This method enables the developer to set the metrics that need to be calculated **after** the API logic.

**Example:**

```
slaManager.reporter.postCalculateMetrics = function(requestedMetrics, req, res, next) {
    req.sla.metrics['x-animalType'] = getAnimalTypes(res.Body);
    next();
};
```

## Predefined metrics

- **responseTime**: The API processing time.
- **requestBody**: The body of the request.
- **responseHeaders**: The headers of the request.
- **responseBody**: The body of the response.
- **userAgent**: Some information about the browser and operating system of the API consumer.

## 4. Winston

**SLA4OAI** uses [Winston](https://github.com/winstonjs/winston) to log all SLA connection activities.
You can customize the Winston logging behaviour by accessing `slaManager.winston` object.

**Example:**
In the following example we change the logging from the Console to the file system: 

```
slaManager.winston.add(slaManager.winston.transports.File, { filename: 'somefile.log' });
slaManager.winston.remove(slaManager.winston.transports.Console);
```