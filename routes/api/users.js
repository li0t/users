/* jshint node: true */
'use strict';

var bcrypt = require('bcrypt');

module.exports = function (router, mongoose) {

    var User = mongoose.model('user'),
        Token = mongoose.model('token'),
        States = {
            Active: null,
            Pending: null,
            Inactive: null
        };

    /* Looks for statics states and saves the ids */
    (function getStates() {
        var Sts = mongoose.model('static.state'),
            state;

        function lookup(name) {
            Sts.find({
                name: name
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    result = null;
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

    /* Get users list. */
    router.get('/', function (req, res, next) {
        User.find(function (err, users) {
            if (err) {
                next(err);
            }
            if (users.length === 0) {
                res.send('The are no users');
            }
            res.send(users);
        });
    });

    /** Create a new user */
    router.post('/create', function (req, res, next) {

        new User({
            email: req.body.email,
            password: req.body.password,
            state: States.Pending,
            info: [{
                name: req.body.name,
                birthdate: req.body.birthdate,
                gender: req.body.gender,
                location: req.body.location
            }]

        }).save(function (err, user) {
            if (err) {
                /* Check for duplicated entry */
                if (err.code && err.code === 11000) {
                    res.status(409).end();
                } else if (err.name && err.name === 'ValidationError') {
                    res.status(400).end();
                } else {
                    next(err);
                }
            } else {
                res.redirect('/mandrill/signin/' + user._id); /* call the email manager */
            }
        });
    });


    /** Token validation */
    router.get('/validate/:token', function (req, res, next) {
        var tkn = req.params.token;
        Token.findOne()
            .where('code', tkn)
            .exec(function (err, token) {
                if (err) {
                    next(err);
                } else if (token) {
                    User.findById(token.user, function (err, user) {
                        if (err) {
                            next(err);
                        } else {
                            user.state = States.Active;
                            res.redirect('/login');
                        }
                    });
                } else {
                    res.send('This token is not active anymore');
                }
            });
    });

    /**
     * Log a user in.
     */
    router.post('/login', function (req, res, next) {

        var email = req.body.email,
            password = req.body.password;

        /* Logout any previous user */
        delete req.session.user;
        delete req.session.workplace;

        /* Find the user by its email address */
        User.findOne()
            .where('email', email)
            .exec(function (err, user) {
                if (err) {
                    next(err);
                } else if (user && bcrypt.compareSync(password, user.password)) { /* Check if there's a user and compare the passwords */
                    if (user.state === States.Active) {
                        req.session.user = user;
                        res.render('/profile');
                    } else if (user.state === States.Pending) {
                        console.log("Looks like you haven't confirmed your email");
                        res.redirect('/mandrill/signin/' + user._id); /* call the email manager */
                    } else {
                        res.render('/reactivate');
                    }
                } else {
                    setTimeout(function () {
                        res.status(401).end();
                    }, 1000);
                }
            });
    });

    /**
     * Logs a user out.
     */
    router.get('/logout', function (req, res, next) {

        delete req.session.user;

        res.end();

    });

    /**
     * Recover a user's password.
     */
    router.post('/recover', function (req, res, next) {

        /* Find the user by its email address, if any */
        User.findOne()
            .where('email', req.body.email)
            .exec(function (err, user) {
                if (err) {
                    next(err);
                } else if (user) {
                    res.redirect('/mandrill/recover/' + user._id);
                } else {
                    res.status(400).end();
                }
            });

    });


    /* Get a user and renders it's profile */
    router.get('/:id', function (req, res, next) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                next(err);
            } else {
                res.send(user);
            }
        });
    });

    //    /* UPDATE USER */
    //    router.post('/edit/:id', function (req, res, next) {
    //        User.update({
    //            _id: req.params.id
    //        }, req.body, function (err, entry) {
    //            if (err) res.render('error', {
    //                title: 'emeeter',
    //                error: err
    //            });
    //            res.redirect('/');
    //        });
    //    });
    //
    //
    //
    //
    //    /* ADD CONTACT */
    //    router.get('/addContact/:idContacto/:idUser', function (req, res, next) {
    //        User.findById(req.params.idUser, function (err, usr) {
    //            if (!err) {
    //                var isContact = false;
    //
    //                for (var i = 0; i < usr.contactos.length; i++)
    //                    if (JSON.stringify(usr.contactos[i]) == JSON.stringify(req.params.idContacto)) {
    //                        isContact = true;
    //                        break;
    //                    }
    //                if (!isContact) {
    //                    usr.contactos.push(req.params.idContacto);
    //                    usr.save(function (err) {
    //                        if (err) res.render('error', {
    //                            title: 'emeeter',
    //                            error: err
    //                        });
    //                        res.redirect('/users/' + usr._id);
    //                    });
    //                } else res.render('error', {
    //                    title: 'emeeter',
    //                    error: new Error('Ya tienes ese contacto')
    //                });
    //            } else res.render('error', {
    //                title: 'emeeter',
    //                error: err
    //            });
    //        });
    //    });
    //
    //
    //    /* DELETE CONTACT */
    //    router.get('/delContact/:idContacto/:idUser', function (req, res, next) {
    //        User.findById(req.params.idUser, function (err, usr) {
    //            if (err) console.log('ERROR! ' + err);
    //
    //            for (var i = 0; i < usr.contactos.length; i++) {
    //                if (JSON.stringify(usr.contactos[i]) === JSON.stringify(req.params.idContacto) || usr.contactos[i] == null) {
    //                    var indexOf = i;
    //                    break;
    //                }
    //            }
    //            if (typeof indexOf === 'number') {
    //                usr.contactos.splice(indexOf, 1);
    //                usr.save(function (err) {
    //                    if (err) res.render('error', {
    //                        title: 'emeeter',
    //                        error: err
    //                    });
    //                    res.redirect('/users/' + usr._id);
    //                });
    //            } else res.render('error', {
    //                title: 'emeeter',
    //                error: new Error('Este contacto no es tuyo!')
    //            });
    //        });
    //    });
    //
    //    router.post('/search', function (req, res, next) {
    //        User.where('username')
    //            .equals(req.body.username)
    //            .exec(function (err, users) {
    //                if (err) res.render('error', {
    //                    title: 'emeeter',
    //                    error: err
    //                });
    //                else
    //                    res.render('list', {
    //                        title: 'emeeter',
    //                        users: users
    //                    });
    //            });
    //    });
    //
    //    router.post('/search/:id', function (req, res, next) {
    //        User.findById(req.params.id, function (err, user) {
    //            if (err) res.render('error', {
    //                title: 'emeeter',
    //                error: err
    //            });
    //            else
    //                User
    //                .where('username')
    //                .equals(req.body.username)
    //                .exec(function (err, users) {
    //                    if (err) res.render('error', {
    //                        title: 'emeeter',
    //                        error: err
    //                    });
    //                    else {
    //                        User.find(function (err, contacts) {
    //                            if (err) res.render('error', {
    //                                title: 'emeeter',
    //                                error: err
    //                            });
    //                            else {
    //                                var contactsList = [];
    //                                /* push real users in the contactsList by their id */
    //                                for (var i = 0; i < contacts.length; i++) {
    //                                    for (var j = 0; j < user.contactos.length; j++)
    //                                        if (JSON.stringify(contacts[i]._id) == JSON.stringify(user.contactos[j])) {
    //                                            contactsList.push(contacts[i]);
    //                                            break;
    //                                        }
    //                                    if (contactsList.length == user.contactos.length)
    //                                        break;
    //                                }
    //                                if (contactsList.length == 0) contactsList = false;
    //                                console.log('tu usuario es : ' + JSON.stringify(user.username));
    //                                console.log('tus contactos son : ' + JSON.stringify(contactsList.length));
    //                                res.render('list', {
    //                                    title: 'emeeter',
    //                                    user: user,
    //                                    users: users,
    //                                    contactos: contactsList
    //                                });
    //                            }
    //                        });
    //                    }
    //                });
    //        });
    //    });
    //
    //
    //    /* GET CONTACTS */
    //    router.get('/:id', function (req, res, next) {
    //        User.findById(req.params.id, function (err, usr) {
    //            if (!err) {
    //                User.find(function (err, usrs) {
    //                    if (!err) {
    //
    //                        /* look out the user in the users list */
    //                        for (var i = 0; i < usrs.length; i++)
    //                            if (JSON.stringify(usrs[i]._id) === JSON.stringify(usr._id)) {
    //                                var indexOf = i;
    //                                break;
    //                            }
    //
    //                            /* remove the user of the users list */
    //                        usrs.splice(indexOf, 1);
    //
    //
    //                        var contactsList = [];
    //                        /* push real users in the contactsList by their id */
    //                        for (var i = 0; i < usrs.length; i++) {
    //                            for (var j = 0; j < usr.contactos.length; j++)
    //                                if (JSON.stringify(usrs[i]._id) == JSON.stringify(usr.contactos[j])) {
    //                                    contactsList.push(usrs[i]);
    //                                    break;
    //                                }
    //                            if (contactsList.length == usr.contactos.length)
    //                                break;
    //                        }
    //                        if (contactsList.length == 0) contactsList = false;
    //                        res.render('list', { /* SAVE A NEW USER */
    //                            title: 'emeeter',
    //                            user: usr,
    //                            users: usrs,
    //                            contactos: contactsList
    //                        });
    //                    } else
    //                        res.render('error', {
    //                            title: 'emeeter',
    //                            error: err
    //                        });
    //
    //                });
    //            } else
    //                res.render('error', {
    //                    title: 'emeeter',
    //                    error: err
    //
    //                });
    //
    //        });
    //    });
    //
    //    /* GET ONE USER */
    //    router.get('/:id', function (req, res, next) {
    //        User.findById(req.params.id, function (err, usr) {
    //            if (err) res.render('error', {
    //                title: 'emeeter',
    //                error: err
    //            });
    //            else
    //                res.render('list', {
    //                    title: 'emeeter',
    //                    user: usr
    //                });
    //        });
    //    });
    //
    //
    //    /* DELET*/
    //    router.delete('/:id', function (req, res, next) {
    //        User.findByIdAndRemove(req.params.id, function (err, usr) {
    //            if (err) res.render('error', {
    //                title: 'emeeter',
    //                error: err
    //            });
    //            else
    //                res.json(usr);
    //        });
    //    });

};