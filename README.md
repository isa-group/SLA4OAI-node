# SLA4OAI (SLA for Open API Initiative) Library
**SLA4OAI** is an open source library for applying SLA in your node application.

**SLA4OAI** is [Express](http://expressjs.com/)-compatible SLA Checking and Monitoring middleware for [Node.js](http://nodejs.org/).

**SLA4OAI** is based on [SLA for Open API Initiative Specification](https://github.com/isa-group/SLA4OAI-Specification/blob/master/README.md).
And follows the [Basic SLA Management Service](https://github.com/isa-group/SLA4OAI-Specification/blob/master/operationalServices.md) proposal.

## Install

```javascript
$ npm install sla4oai-tools --save
```

## Basic Usage
You can simply use the library by registering it with the Express app with your plans file as local:

```javascript
var sla4oaiTools = require('sla4oai-tools'); //import
var slaManager = new sla4oaiTools(); //create a instance of slaManager
var app = express();

var configObj = {
    sla4oai: __dirname + "/petstore-plans.yaml"
};

slaManager.initialize(app, configObj, function(slaManager, error){
    //any callback actions
    if(!error){
        app.listen(9000);
    }else{
        console.log(error.toString());
    }
});
```

## API Reference
## 1. SlaManager

### initialize
Initialize all library components as express middlewares. Called once when the server getting up.

#### Parameters:

| Name      | Type                                          | Description                                                                                                                                      |
| :-------- | :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| app       | `Express`                                     | **Required** - The express app.                                                                                                                  |
| configObj | [`ConfigurationObject`](#configurationObject) | **Required** - The configuration details for each components.                                                                                    |
| callback  | `Function`                                    | **Required** - The callback function to be execute, it will recive two parameters: `slaManager` for post-configuration and `error` if it exists. |

#### ConfigurationObject:

| Name                 | Type                                    | Description                                                                                                                  |
| :------------------- | :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| sla4oai              | `string`                                | **Required** The URL or file path to the sla4oai document                                                                    |
| sla4oaiUI            | [`Sla4oaiUIObject`](#sla4oaiUIObject)   | **Optional** Object which contains the Sla4oaiUI component configuration                                                     |
| supervisorConnection | [`ConnectionObject`](#connectionObject) | **Optional** The connection details for Supervisor and ScopeResolver. By default it get the connection from Sla4oai document |
| monitorConnection    | [`ConnectionObject`](#connectionObject) | **Optional** The connection details for Monitor component. By default it get the connection from Sla4oai document            |

#### ConnectionObject:

| Name | Type     | Description |
| :--- | :------- | :---------- |
| url  | `string` | Host url.   |

#### Sla4oaiUIOptions:

| Name                  | Type     | Description                                                                                            |
| :-------------------- | :------- | :----------------------------------------------------------------------------------------------------- |
| path                  | `string` | **Optional**  Middleware will be allocated on this path.  By default `/plans`.                         |
| portalSuccessRedirect | `string` | **Optional** URL where UI will redirect when result is successful. `/docs` by default.                 |
| portalURL             | `string` | **Optional** In case you have a own portal that is served in other server, URL where portal is served. |

**Example:**

```javascript
var sla4oaiTools = require('sla4oai-tools'); //import
var slaManager = new sla4oaiTools(); //create a instance of slaManager
var app = express();

var configObj = {
    sla4oai: __dirname + "/petstore-plans.yaml",
    sla4oaiUI: {
        path: "/plans",
        portalSuccessRedirect: "/pets",
        portalUrl: null
    },
    supervisorConnection: {
        url: 'http://supervisor.oai.governify.io/api/v2'
    },
    monitorConnection: {
        url: 'http://monitor.oai.governify.io/api/v1'
    }
}

slaManager.initialize(app, configObj, function(slaManager, error){
    //any callback actions
    if(!error){
        app.listen(9000);
    }else{
        console.log(error.toString());
    }
});
```

## 2. Scope Resolver

### configure
Use this method to set the configuration parameters of the Scope Resolver.

#### Configuration parameters:

| Name                 | Type                                                  | Description                                                                                                         |
| :------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| notCheckByDefault    | `boolean`                                             | Decides if it uses a list of default paths that don't need checking. By default `true` and `["/docs", "/api-docs"]` |
| defaultOAuthProvider | `string`                                              | The default provider when **oauthprovider** is missing in the request header.                                       |
| config               | [`<provider, OAuthConfigObject>`](#oauthconfigobject) | OAuth provider configurations.                                                                                      |

#### OAuthConfigObject:

| Name         | Type     | Description                                          |
| :----------- | :------- | :--------------------------------------------------- |
| clientId     | `string` | The provider application id.                         |
| clientSecret | `string` | The provider application secret.                     |
| callbackURL  | `string` | The callback registered in the provider application. |

**Example:**

```javascript
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

```javascript
slaManager.scopeResolver.getAccountName(oauthProvider, token, function (err, accountName) {
    // get accountName
});
```

### getAccountScope
Using this method to get the scope object from the supervisor by the specifying the apikey or the account name.

**Example:**

```javascript
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

| Name              | Type      | Description                                                                                                         |
| :---------------- | :-------- | :------------------------------------------------------------------------------------------------------------------ |
| environment       | `string`  | The deploying environment (devel, qa, or production).                                                               |
| notCheckByDefault | `boolean` | Decides if it uses a list of default paths that don't need checking. By default `true` and `["/docs", "/api-docs"]` |
**Example:**

```javascript
var options = {
	environment: 'qa'
};
slaManager.bouncer.configure(options);
```

### needChecking
By default, all incoming requests are verified by SLA Check, but you can customize this behaviour and specify which requests need checking in both bouncer and scopeResolver components.

**Example:**

```javascript
slaManager.bouncer.needChecking = function(req) {
    if (req.originalUrl.startsWith('/api/')) {
        return true;
    }
    return false;
}

slaManager.scopeResolver.needChecking = function(req) {
     if (req.originalUrl.startsWith('/api/')) {
        return true;
    }
    return false;
}
```

### decline
By default, bouncer declines all not accepted requested with status code `403` and the body that comes from the Supervisor. But you can customize the decline response message.

**Example:**

```javascript
slaManager.bouncer.decline = function(req, res, next, supervisorPayload) {
    if(supervisorPayload.reason === 'Too many requests') {
        res.status(429).json(supervisorPayload.reason).end();
    }
    else {
        res.status(403).json(supervisorPayload).end();
    }
}
```

### resolveMetrics
In order to resolve the required metrics for the check API, you need to define `resolveMetrics` function and return all metrics in single object.

**Example:**

```javascript
slaManager.bouncer.resolveMetrics = function (requestedMetrics, req) {
    return {
        nameLegth: 12
    };
};
```

## 3. Reporter

### configure
Use this method to set the configuration parameters of the Reporter.

#### Configuration parameters:

| Name              | Type      | Description                                                                                                                                                                                              |
| :---------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autoReport        | `boolean` | In case of `true`, all API calls will be reported one by one, else the developer can aggregate multiple API calls in one report (default = true).                                                        |
| aggregate         | `boolean` | Aggregate multiple measures in one report, this aggregated measures will be frequently sended based on the `aggregationPeriod` (default = false). *This features is disabled if the autoReport = false*. |
| aggregationPeriod | `double`  | All requests during this period will be aggregated in one report. It is calculated in milliseconds.                                                                                                      |
| cluster           | `string`  | The cluster that process this API.                                                                                                                                                                       |
| environment       | `string`  | The deploying environment (devel, qa, or production).                                                                                                                                                    |

**Example:**

```javascript
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

```javascript
slaManager.reporter.reportMetrics();
```

### setMetric
At any stage of the API logic, the developer can set a custom metric by simply passing its name and value.

**Example:**

```javascript
slaManager.reporter.setMetric(req, 'animalTypes', records.length);
```

### preCalculateMetrics
This method enables the developer to set the metrics that need to be calculated **before** the API logic.

**Example:**

```javascript
slaManager.reporter.preCalculateMetrics = function(requestedMetrics, req, next) {
    req.sla.metrics['x-origin'] = req.headers['origin'];
    next();
};
```

### postCalculateMetrics
This method enables the developer to set the metrics that need to be calculated **after** the API logic.

**Example:**

```javascript
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

## 4. Sla4oaiUI
This component makes UI where `plans.yaml` document is represented on an user interface way.

**Example**

```javascript

var configObj = {
    sla4oai: __dirname + "/petstore-plans.yaml",
    sla4oaiUI: {
        portalSuccessRedirect: "/pets"
    }
}


slaManager.initialize(app, configObj, function(slaManager, error){
    //any callback actions
    if(!error){
        app.listen(9000);
    }else{
        console.log(error.toString());
    }
});

```

## 5. Winston

**SLA4OAI** uses [Winston](https://github.com/winstonjs/winston) to log all SLA connection activities.
You can customize the Winston logging behaviour by accessing `slaManager.winston` object.

**Example:**
In the following example we change the logging from the Console to the file system:

```
slaManager.winston.add(slaManager.winston.transports.File, { filename: 'somefile.log' });
slaManager.winston.remove(slaManager.winston.transports.Console);
```
