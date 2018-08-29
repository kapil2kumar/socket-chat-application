var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var userSchema = new Schema({
    name:  {
        type: String,
        required:[true ,'Name is Required']
    },
    email: {
        type: String, 
        required:[true ,'Email is Required'],
        lowercase: true, 
        unique: [true ,'Email must be Unique']
    },
    password: {
        type: String,
        required:[true ,'Password is Required']
    },
    role:{
        type: String,
        enum: ['admin', 'doctor','patient'],
        required:true
    }
},{ collection : 'user' });


userSchema.methods.uniqueEmail = function(cb) {
    return this.model('user').find({ email: this.email }, cb);
};

var User = mongoose.model('user', userSchema);

module.exports=User;

