var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    username : String,
    contactos : []
}); 

UserSchema.virtual('countactos')
    .get(function () {
        return this.username + ' tiene ' + contactos.length  + 'contactos';
    });

UserSchema.pre('save', function (next){
    this.username = this.username.trim();
    next();
});


UserSchema.pre('findByIdAndRemove', function (next){
    /* tell friend that i'm gone */
});
module.exports = mongoose.model('User', UserSchema);