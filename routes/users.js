var express = require('express');
var router = express.Router();

var User = require('../User.js');

/* GET users listing. */
router.get('/', function (req, res, next) {
    User.find(function (err, usrs) {
        if (err) res.render('error', {
            title: 'emeeter',
            error: err
        });
        if (usrs.length == 0) usrs = false;
        res.render('list', {
            title: 'emeeter',
            users: usrs
        });
    });
});


/* SAVE A NEW USER */
router.post('/', function (req, res, next) {
    var user = {
        username: req.body.username
    };
    User.create(user, function (err, usr) {
        if (err) res.render('error', {
            title: 'emeeter',
            error: err
        });
        res.redirect('/');
    });
});


/* UPDATE USER */
router.post('/edit/:id', function (req, res, next) {
    User.update({
        _id: req.params.id
    }, req.body, function (err, entry) {
        if (err) res.render('error', {
            title: 'emeeter',
            error: err
        });
        res.redirect('/');
    });
});




/* ADD CONTACT */
router.get('/addContact/:idContacto/:idUser', function (req, res, next) {
    User.findById(req.params.idUser, function (err, usr) {
        if (!err) {
            var isContact = false;

            for (var i = 0; i < usr.contactos.length; i++)
                if (JSON.stringify(usr.contactos[i]) == JSON.stringify(req.params.idContacto)) {
                    isContact = true;
                    break;
                }
            if (!isContact) {
                usr.contactos.push(req.params.idContacto);
                usr.save(function (err) {
                    if (err) res.render('error', {
                        title: 'emeeter',
                        error: err
                    });
                    res.redirect('/users/' + usr._id);
                });
            } else res.render('error', {
                title: 'emeeter',
                error: new Error('Ya tienes ese contacto')
            });
        } else res.render('error', {
            title: 'emeeter',
            error: err
        });
    });
});


/* DELETE CONTACT */
router.get('/delContact/:idContacto/:idUser', function (req, res, next) {
    User.findById(req.params.idUser, function (err, usr) {
        if (err) console.log('ERROR! ' + err);

        for (var i = 0; i < usr.contactos.length; i++) {
            if (JSON.stringify(usr.contactos[i]) === JSON.stringify(req.params.idContacto) || usr.contactos[i] == null) {
                var indexOf = i;
                break;
            }
        }
        if (typeof indexOf === 'number') {
            usr.contactos.splice(indexOf, 1);
            usr.save(function (err) {
                if (err) res.render('error', {
                    title: 'emeeter',
                    error: err
                });
                res.redirect('/users/' + usr._id);
            });
        } else res.render('error', {
            title: 'emeeter',
            error: new Error('Este contacto no es tuyo!')
        });
    });
});

router.post('/search', function (req, res, next) {
    User.where('username')
        .equals(req.body.username)
        .exec(function (err, users) {
            if (err) res.render('error', {
                title: 'emeeter',
                error: err
            });
            else
                res.render('list', {
                    title: 'emeeter',
                    users: users
                });
        });
});

router.post('/search/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) res.render('error', {
            title: 'emeeter',
            error: err
        });
        else
            User
            .where('username')
            .equals(req.body.username)
            .exec(function (err, users) {
                if (err) res.render('error', {
                    title: 'emeeter',
                    error: err
                });
                else {
                    User.find(function (err, contacts) {
                        if (err) res.render('error', {
                            title: 'emeeter',
                            error: err
                        });
                        else {
                            var contactsList = [];
                            /* push real users in the contactsList by their id */
                            for (var i = 0; i < contacts.length; i++) {
                                for (var j = 0; j < user.contactos.length; j++)
                                    if (JSON.stringify(contacts[i]._id) == JSON.stringify(user.contactos[j])) {
                                        contactsList.push(contacts[i]);
                                        break;
                                    }
                                if (contactsList.length == user.contactos.length)
                                    break;
                            }
                            if (contactsList.length == 0) contactsList = false;
                            console.log('tu usuario es : ' + JSON.stringify(user.username));
                            console.log('tus contactos son : ' + JSON.stringify(contactsList.length));
                            res.render('list', {
                                title: 'emeeter',
                                user: user,
                                users: users,
                                contactos: contactsList
                            });
                        }
                    });
                }
            });
    });
});


/* GET CONTACTS */
router.get('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, usr) {
        if (!err) {
            User.find(function (err, usrs) {
                if (!err) {

                    /* look out the user in the users list */
                    for (var i = 0; i < usrs.length; i++)
                        if (JSON.stringify(usrs[i]._id) === JSON.stringify(usr._id)) {
                            var indexOf = i;
                            break;
                        }

                        /* remove the user of the users list */
                    usrs.splice(indexOf, 1);


                    var contactsList = [];
                    /* push real users in the contactsList by their id */
                    for (var i = 0; i < usrs.length; i++) {
                        for (var j = 0; j < usr.contactos.length; j++)
                            if (JSON.stringify(usrs[i]._id) == JSON.stringify(usr.contactos[j])) {
                                contactsList.push(usrs[i]);
                                break;
                            }
                        if (contactsList.length == usr.contactos.length)
                            break;
                    }
                    if (contactsList.length == 0) contactsList = false;
                    res.render('list', { /* SAVE A NEW USER */
                        title: 'emeeter',
                        user: usr,
                        users: usrs,
                        contactos: contactsList
                    });
                } else
                    res.render('error', {
                        title: 'emeeter',
                        error: err
                    });

            });
        } else
            res.render('error', {
                title: 'emeeter',
                error: err

            });

    });
});

/* GET ONE USER */
router.get('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, usr) {
        if (err) res.render('error', {
            title: 'emeeter',
            error: err
        });
        else
            res.render('list', {
                title: 'emeeter',
                user: usr
            });
    });
});


/* DELETE AN USER */
router.delete('/:id', function (req, res, next) {
    User.findByIdAndRemove(req.params.id, function (err, usr) {
        if (err) res.render('error', {
            title: 'emeeter',
            error: err
        });
        else
            res.json(usr);
    });
});

module.exports = router;


/*   */