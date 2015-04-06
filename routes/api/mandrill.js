/* jslint node: true */
'use strict';

var Mandrill = require('mandrill-api/mandrill').Mandrill;


module.exports = function (router, mongoose) {

    var apiKey = 'DhTgCrDsRExbzSfSU-3dLw',
        api = false,
        User = mongoose.model('user'),
        Token = mongoose.model('token'),
        getMessage = function (email, token) {
            var message = {
                "html": "<a href='localhost:3030/users/validate/'" + token + ">Please confirm your email</a>",
                "text": "Bievenido a eMeeter",
                "subject": "Confirm your email",
                "from_email": "leonardo0ramos@gmail.com",
                "from_name": "Leonardo Ramos",
                "to": [{
                    "email": email,
                    "name": "",
                    "type": "to"
                }],
                "headers": {
                    "Reply-To": ""
                },
                "important": false,
                "track_opens": true,
                "track_clicks": true,
                "auto_text": false,
                "auto_html": false,
                "inline_css": false,
                "url_strip_qs": false,
                "preserve_recipients": false,
                "view_content_link": true,
                "bcc_address": "",
                "tracking_domain": null,
                "signing_domain": null,
                "return_path_domain": null,
                "merge": true,
                "merge_language": "mailchimp",
                "global_merge_vars": [{
                    "name": "merge1",
                    "content": "merge1 content"
                }],
                "merge_vars": [{
                    "rcpt": email,
                    "vars": [{
                        "name": "merge2",
                        "content": "merge2 content"
                    }]
                }],
                "tags": [
                "email-confirmation"
                ],
                "subaccount": "",
                "google_analytics_domains": [
                ""
                ],
                "google_analytics_campaign": "",
                "metadata": {
                    "website": ""
                },
                "recipient_metadata": [{
                    "rcpt": "",
                    "values": {
                        "user_id": ""
                    }
                }],
                "attachments": [{
                    "type": "",
                    "name": "",
                    "content": ""
                }],
                "images": [{
                    "type": "",
                    "name": "",
                    "content": ""
                }]
            }
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

    (function addTemplate() {
        if (api) {
            var name = "Confirm EmailTemplate",
                from_email = "from_leonardo0ramos@gmail.com",
                from_name = "Leonardo Ramos",
                subject = "Email Confirmation",
                code = "<div><a href='localhost:3030/users/validate/>CONFIRMAR</a></div>",
                text = "Haz click en el siguiente link para confirmar tu email",
                publish = false,
                labels = [
                    "confirm"
                ];
            api.templates.add({
                "name": name,
                "from_email": from_email,
                "from_name": from_name,
                "subject": subject,
                "code": code,
                "text": text,
                "publish": publish,
                "labels": labels
            }, function (result) {
                console.log(result);

            }, function (err) {
                // Mandrill returns the error as an object with name and message keys
                console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
                // A mandrill error occurred: Invalid_Key - Invalid API key
            });
        } else {
            console.log('A error occurred with the Mandrill client');
        }
    });



    /* Sends confirmation email */
    router.get('/signin/:id', function (req, res, next) {
        if (api) {
            var mesagge = null,
                async = false,
                ip_pool = 'Main Pool',
                send_at = new Date();

            User.findOne()
                .where('_id', req.params.id)
                .exec(function (err, user) {
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
                                        console.log(err);
                                    } else {
                                        mesagge = getMessage(user.email, token._id);
                                        console.log('The message is : ' + JSON.stringify(mesagge));
                                        api.messages.send({ /* Send a confirmation email to the user */
                                            "mesagge": mesagge,
                                            "async": async,
                                            "ip_pool": ip_pool,
                                            "send_at": send_at
                                        }, function (result) {
                                            console.log(result);
                                            res.send("You've been sent a confirmation email.");
                                        }, function (err) {
                                            console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
                                        });
                                    }
                                });
                            }
                        });
                    }

                })
        } else {
            console.log('A error occurred with the Mandrill client');
            res.end();
        }
    });



}