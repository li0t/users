var Mandrill = require('mandrill-api/mandrill').Mandrill;
var apiKey = 'DhTgCrDsRExbzSfSU-3dLw';

var api = false;

function connectToMandrill() {
    try {
        api = = new Mandrill(apiKey);
        console.log('api initialiced');
    } catch (error) {
        console.log(error.message);
    }
}();