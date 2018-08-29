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

    // var where={email:'admin@example.com'};
    // User.findOne(where, function (err, admin) {
    //   if (err) { 
    //     console.log(err);
    //   }
    //   if (!user) {
    //     var user = new User({
    //       name:'Admin Admin',
    //       email:'admin@example.com',
    //       password:crypto.createHash('md5').update('123456').digest("hex"),
    //       role:'admin'
    //     });
    //     user.save(function (err){
    //       if(err){ 
    //           console.log('Not Able to Create Admin');
    //           console.log(err);
    //           console.log(err.message);
    //           console.log(err.name);
    //       } else {
    //         console.log('Admin create');
    //       }
    //     });
    //   } else {
    //     console.log('Admin Exist');
    //   }  
    // });