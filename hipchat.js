"use strict";
var https = require("https");

var sendMessage = function (room, secret, message, callback) {
    if (room && secret && message) {
        var body = {
            color: "random",
            message: message,
            message_format: "text",
            notify: true
        },
            options = {
                hostname: 'api.hipchat.com',
                port: 443,
                path: '/v2/room/' + room + '/notification',
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + secret,
                    'Content-Type': "application/json"
                }
            },
            responsebody = '',
            httpreq = https.request(options, function (response) {
                console.log('hipchat send response is ' + response.statusCode);
                response.on('data', function (d) {
                    responsebody = responsebody + d;
                    console.log(responsebody);
                });
                if (response.statusCode === 204 && callback) {
                    callback(null);
                } else if (callback) {
                    callback("Error replying to hipchat");
                }
            });
        httpreq.write(JSON.stringify(body));
        httpreq.end();
        httpreq.on('error', function (e) {
            if (callback) {
                callback(e);
            }
        });
    } else if (callback) {
        callback("parameters missing");
    }
};

module.exports = {
    sendMessage: sendMessage
};
