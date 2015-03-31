var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'emeeter'
    });
});

/* RENDER SIGN UP TEMPLATE */
router.get('/signup', function (req, res, next) {
    console.log('holo');
    res.render('signup', {
        title: 'emeeter'
    });
});


module.exports = router;