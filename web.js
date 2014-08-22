var https = require("https");

var express = require("express");
var bodyParser = require("body-parser");
var logfmt = require("logfmt");
var querystring = require("querystring");

var app = express();
var capabilities = require("./capabilities.js");
var hipchat = require("./hipchat.js");

app.use(logfmt.requestLogger());
app.use(bodyParser.json());
app.use(express.static('public'));

var secrets = {};


function success(res) {
    "use strict";
    res.send("Your request has been sent. Thank you!");
}

app.get('/capabilities', function (req, res) {
    "use strict";
    res.send(JSON.stringify(capabilities.capabilities));
});

app.post('/installable', function (req, res) {
    "use strict";
    var capabilitiesUrl = req.body.capabilitiesUrl,
        oauthId = req.body.oauthId,
        oauthSecret = req.body.oauthSecret,
        roomId = req.body.roomId,
        options,
        body,
        responsebody = '',
        httpreq;
    if (capabilitiesUrl && oauthId && oauthSecret) {
        // Obtain token
        options = {
            hostname: 'api.hipchat.com',
            port: 443,
            path: '/v2/oauth/token',
            method: 'POST',
            auth: oauthId + ':' + oauthSecret,
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
        };
        body = {
            grant_type: "client_credentials",
            scope: "send_notification",
        };
        httpreq = https.request(options, function (response) {
            console.log('token response is ' + response.statusCode);
            if (response.statusCode === 200) {
                res.send("OK");
            } else {
                res.status(500);
                console.error("Authentication error with hipchat");
                res.send("Authenitcation error");
            }
            response.on('data', function (d) {
                responsebody = responsebody + d;
                secrets[roomId] = JSON.parse(responsebody).access_token;
            });
        });
        httpreq.write(querystring.stringify(body));
        httpreq.end();
        httpreq.on('error', function (e) {
            res.status(500);
            console.error(e);
            console.error("Authentication error with hipchat");
            res.send("Authenitcation error");
        });
    } else {
        res.status(500);
        res.send("Not enough information provided for installable");
    }
});

app.post('/hipchat', function (req, res) {
    "use strict";
    var item = req.body.item,
        message = item && item.message.message,
        room = item && item.room && item.room.id,
        from = item && item.message.from.object.name,
        secret = secrets[room];
    hipchat.sendMessage(room, secret, 'echo ' + from + ': ' + message, function (err) {
        if (err) {
            res.status(500);
            console.error(err);
            res.send(err);
        } else {
            res.send("OK");
        }
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function () {
    "use strict";
    console.log("Web server started " + new Date().toString());
    console.log("Listening on " + port);
});

