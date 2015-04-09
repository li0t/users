/* jslint node: true */
'use strict';

var Mandrill = require('mandrill-api/mandrill').Mandrill;


module.exports = function (router, mongoose) {

    var apiKey = 'DhTgCrDsRExbzSfSU-3dLw',
        url = 'localhost:3030',
        api = false,
        User = mongoose.model('user'),
        Token = mongoose.model('token'),
        getMessage = function (email, token) {
            var message = {
                "html": "<a href='http://" + url + "/api/users/validate/" + token + "'>Please confirm your email</a>" +
                    "<img src='http://blog.mandrill.com/images/mandrill-shield.png' alt='Mandrill'/>",
                "text": "Bievenido a eMeeter",
                "subject": "Confirm your email",
                "from_email": "leonardo0ramos@gmail.com",
                "from_name": "Leonardo Ramos",
                "to": [{
                    "email": email,
                    "name": "New eMeeter user",
                    "type": "to"
                }],
                "headers": {
                    "Reply-To": "noreply@emeeter.com"
                },
                "important": false,
                "track_opens": true,
                "track_clicks": true,
                "auto_text": true
            };
            return message;
        };

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

    /* Sends confirmation email */
    router.get('/signin/:id', function (req, res, next) {
        if (api) {
            var message = null
                /*,
                                async = false,
                                ip_pool = 'Main Pool',
                                send_at = new Date()*/
            ;

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
                                    message = getMessage(user.email, token._id);
                                    api.messages.send({ /* Send a confirmation email to the user */
                                        "message": message
                                            /*,
                                                                                        "async": async,
                                                                                        "ip_pool": ip_pool,
                                                                                        "send_at": send_at*/
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



};