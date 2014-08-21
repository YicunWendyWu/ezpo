module.exports.capabilities = {
    "name": "ezpo",
    "description": "An add-on that does ezpo",
    "key": "com.herokuapps.ezpo",
    "links": {
        "homepage": "https://ezpo.herokuapp.com",
        "self": "https://ezpo.herokuapp.com/capabilities"
    },
    "capabilities": {
        "installable": {
            "callbackUrl": "https://ezpo.herokuapp.com/installable"
        },
        "hipchatApiConsumer": {
            "scopes": ["send_notification"]
        },
        "webhook": [
            {
                "event": "room_message",
                "pattern": "\/ezpo.*",
                "url": "https://ezpo.herokuapp.com/hipchat"
            },
        ]
    }
};

