/* jslint node: true */
'use strict';

var Mandrill = require('mandrill-api/mandrill').Mandrill;


module.exports = function (router, mongoose) {

    var apiKey = 'DhTgCrDsRExbzSfSU-3dLw',
        url = 'localhost:3030',
        api = false,
        sender = "emeeter",
        senderEmail = "leonardo0ramos@gmail.com",
        User = mongoose.model('user'),
        Token = mongoose.model('token');

    (function connectToMandrill() {
        try {
            api = new Mandrill(apiKey);
            console.log('api initialiced');
        } catch (error) {
            console.log(error.message);
        }
    })();

    /* Lists all users in this mandrill account */
    router.get('/users', function (req, res, next) {
        if (api) {
            api.users.info({},
                function (users) {
                    console.log(users);
                },
                function (err) {
                    console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
                    res.end();
                }
            );
        } else {
            console.log('A error occurred with the Mandrill client');
            res.end();
        }
    });

    /** 
     * Sends confirmation email
     */
    router.get('/signin/:id', function (req, res, next) {
        if (api) {
            User.findById(req.params.id, function (err, user) {
                if (err) {
                    next(err);
                } else {
                    Token.remove({ /* Removes any previous tokens assigned to the user */
                        user: user._id
                    }, function (err) {
                        if (err) {
                            next(err);
                        } else {
                            new Token({ /* Assigns a new Token to the user */
                                user: user._id
                            }).save(function (err, token) {
                                if (err) {
                                    next(err);
                                } else {
                                    var template_name = "Email Confirmation";
                                    var template_content = [{
                                        "name": "",
                                        "content": ""
                                    }];
                                    var message = {
                                        "to": [{
                                            "email": user.email,
                                            }],
                                        "track_opens": true,
                                        "track_clicks": true,
                                        "inline_css": true,
                                        "merge": true,
                                        "merge_language": "mailchimp",
                                        "global_merge_vars": [{
                                            "name": "TOKENID",
                                            "content": token._id
                                            }],

                                    };
                                    api.messages.sendTemplate({
                                        "template_name": template_name,
                                        "template_content": template_content,
                                        "message": message,
                                    }, function (result) {
                                        console.log(result);
                                        res.send("You've been sent a confirmation email.");
                                    }, function (err) {
                                        console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
                                        res.end();
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            console.log('A error occurred with the Mandrill client');
            res.end();
        }
    });

    /**
     * Send Contact Request
     */
    router.get('/addContact/:id', function (req, res, next) {
        if (api) {
            var message = null;
            User.findById(req.params.id, function (err, user) {
                if (err) {
                    next(err);
                } else if (user) {
                    message = {
                        "html": "<a href='http://" + url + "/api/users/" + user._id + "'>Go to emeeter</a>",
                        "text": "Someone wants to contact you",
                        "subject": "Someone wants to contact you",
                        "from_email": senderEmail,
                        "from_name": sender,
                        "to": [{
                            "email": user.email,
                            "name": user.email,
                            "type": "to"
                      }],
                        "headers": {
                            "Reply-To": "noreply@emeeter.com"
                        },
                        "track_opens": true,
                        "track_clicks": true,
                        "auto_text": true
                    };
                    api.messages.send({ /* Send a confirmation email to the user */
                        "message": message
                    }, function (result) {
                        console.log(result);
                        res.send("You have sent a contact request! Good!");
                    }, function (err) {
                        console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
                        res.end();
                    });
                } else {
                    res.status(404).end();
                }
            });
        } else {
            console.log('A error occurred with the Mandrill client');
            res.end();
        }
    });

    /**
     * Get Mandrill template by it's name
     */
    router.get('/templates/:name', function (req, res, next) {
        if (api) {
            api.templates.info({
                    "name": req.params.name
                },
                function (template) {
                    res.send(template);
                },
                function (err) {
                    console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
                });

        } else {
            console.log('A error occurred with the Mandrill client');
            res.end();
        }
    });
};