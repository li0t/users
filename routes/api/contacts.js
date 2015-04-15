/* jshint node: true */
'use strict';

var bcrypt = require('bcrypt'),
    _ = require('underscore');

module.exports = function (router, mongoose) {

    var Contact = mongoose.model('contact'),
        User = mongoose.model('user'),
        Token = mongoose.model('token'),
        States = {
            Active: null,
            Pending: null,
            Disabled: null
        };

    /** 
     * Looks for statics states and saves the ids
     *
     * FALLS WHEN THERE ARE NO STATICS INSTALLED
     */
    (function getStates() {
        var
            Sts = mongoose.model('static.state'),
            state;

        function lookup(name) {
            Sts.find({
                name: name
            }, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    States[name] = result[0]._id;
                }
            });
        }

        for (state in States) {
            if (States.hasOwnProperty(state)) {
                lookup(state);
            }
        }

    })();


    /** 
     * Add contact
     */
    router.get('/add/:id', function (req, res, next) {
        Contact.find()
            .where('user', req.params.id)
            .exec(function (err, receiver) { /* The ContactSchema of the receiver */
                if (err) {
                    next(err);
                } else if (receiver) {
                    Contact.find().where('user', req.session.user._id).exec(function (err, sender) { /* The ContactSchema of the sender */
                        if (err) {
                            next(err);
                        } else if (sender) {
                            sender[0].contacts.push({ /* Push the receiver id into the sender contacts */
                                user: req.params.id,
                                state: States.Pending
                            });
                            receiver[0].contacts.push({ /* Push the sender id into the receiver contacts */
                                user: req.session.user._id,
                                state: States.Pending
                            });
                            sender[0].save(function (err) {
                                if (err) {
                                    next(err);
                                } else {
                                    receiver[0].save(function (err) {
                                        if (err) {
                                            next(err);
                                        } else {
                                            res.redirect('/api/mandrill/addContact/' + req.params.id); /* Redirect to email manager */
                                        }
                                    });
                                }
                            });
                        } else {
                            res.status(404).end();
                        }

                    });
                } else {
                    res.status(404).end();
                }
            });
    });

    /** 
     *  Confirm request
     */
    router.get(':receiverId/confirm/:senderId', function (req, res, next) {
        Contact.find().where('user', req.params.id).exec(function (err, sender) {
            if (err) {
                next(err);
            } else if (sender) {
                Contact.find().where('user', req.session.user._id).exec(function (err, receiver) {
                    if (err) {
                        next(err);
                    } else if (receiver) {
                        for (var i = 0; i < sender[0].contacts.length; i++) {
                            if (JSON.stringify(sender[0].contacts[i].user) === JSON.stringify(req.session.user._id)) {
                                sender[0].contacts[i].state = States.Active;
                                break;
                            }
                        }
                        for (i = 0; i < receiver[0].contacts.length; i++) {
                            if (JSON.stringify(receiver[0].contacts[i].user) === JSON.stringify(req.params.id)) {
                                receiver[0].contacts[i].state = States.Active;
                                break;
                            }
                        }
                        sender[0].save(function (err) {
                            if (err) {
                                next(err);
                            } else {
                                receiver[0].save(function (err) {
                                    if (err) {
                                        next(err);
                                    } else {
                                        res.redirect('/api/users/' + req.session.user._id);
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(404).end();
                    }
                });
            } else {
                res.status(404).end();
            }
        });
    });

    router.get('/delete/:id', function (req, res, next) {
        /*TODO*/
    });

};