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
var votes = {};
var lucks = {};

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
                votes[roomId] = {};
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
        from = item && item.message && item.message.from && item.message.from.name,
        message = item && item.message && item.message.message,
        messageParts,
        room = item && item.room && item.room.id,
        secret = secrets[room],
        time,
        vote,
        votename,
        total,
        i,
        luckynum,
        randomNum;
    function send(message) {
        hipchat.sendMessage(room, secret, message, function (err) {
            if (err) {
                res.status(500);
                console.error(err);
                res.send(err);
            } else {
                res.send("OK");
            }
        });
    }
    if (message) {
        messageParts = message.split(" ");
        if (messageParts.length > 2 && messageParts[1] === "timer") {
            time = parseInt(messageParts[2], 10);
            if (isNaN(time)) {
                send('timer error: second argument should be a number');
                return;
            }
            message = '';
            if (messageParts.length > 3) {
                message = messageParts.slice(3).join(" ");
            }
            setTimeout(function () {
                send('Time is up: ' + message);
            }, time * 60000);
        } else if (messageParts.length === 3 && messageParts[1] === "votestart") {
            votename = messageParts[2];
            votes[room][votename] = {};
            votes[room][votename].voters = [];
            send("created vote: " + votename);
        } else if (messageParts.length === 3 && messageParts[1] === "votestatus") {
            votename = messageParts[2];
            if (votes[room] && votes[room][votename]) {
                send(JSON.stringify(votes[room][votename]));
            } else {
                send("No vote status for " + votename);
            }
        } else if (messageParts.length === 4 && messageParts[1] === "vote") {
            votename = messageParts[2];
            vote = messageParts[3];
            if (votes[room] && votes[room][votename] && votes[room][votename].voters.indexOf(from) === -1) {
                if (votes[room][votename][vote]) {
                    votes[room][votename][vote] = votes[room][votename][vote] + 1;
                } else {
                    votes[room][votename][vote] = 1;
                }
                votes[room][votename].voters.push(from);
                send("Vote recorded");
            } else {
                send("Invalid vote, please verify information is correct");
            }
        } else if (messageParts.length === 4 && messageParts[1] === "luckystart") {
            total = parseInt(messageParts[2], 10);
            luckynum = parseInt(messageParts[3], 10);
            if (!isNaN(total) && !isNaN(luckynum) && luckynum < total && luckynum > 0 && total > 0) {
                lucks[room] = [];
                for (i = 0; i < total; i += 1) {
                    lucks[room].push(0);
                }
                for (i = 0; i < luckynum; i += 1) {
                    randomNum = Math.floor(Math.random() * (luckynum + 1));
                    while (lucks[room][randomNum] === 1) {
                        randomNum = Math.floor(Math.random() * (luckynum + 1));
                    }
                    lucks[room][randomNum] = 1;
                }
                send("Game set up");
            } else {
                send("Invalid luckystart arguments");
            }
        } else if (messageParts.length === 3 && messageParts[1] === "lucky") {
            luckynum = parseInt(messageParts[2], 10);
            if (!isNaN(luckynum) && luckynum > 0 && lucks[room] && luckynum <= lucks[room].length) {
                if (lucks[room][luckynum - 1] === 1) {
                    message = "You picked a lucky number!";
                } else {
                    message = "Not a lucky day for you";
                }
                send(message);
            } else {
                send("invalid lucky number");
            }
        } else {
            send("Invalid command");
        }
    }
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function () {
    "use strict";
    console.log("Web server started " + new Date().toString());
    console.log("Listening on " + port);
});

