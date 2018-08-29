var crypto = require('crypto');
//MOngoDB
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
//connect to local mongodb database
var db = mongoose.connect('mongodb://127.0.0.1:27017/hospital_demo',{ useNewUrlParser: true });
//attach lister to connected event
mongoose.connection.once('connected', function(err) {
  if(err){
    throw err;
    process.exit(1);

  } else {
    console.log("Connected to database");
    var User = require('./models/Users');
    var where={email:'admin@example.com'};
    User.findOne(where, function (err, admin) {
      if (err) { 
        console.log(err);
        process.exit(1);

      }
      if (!admin) {
        var user = new User({
          name:'Admin Admin',
          email:'admin@example.com',
          password:crypto.createHash('md5').update('123456').digest("hex"),
          role:'admin'
        });
        user.save(function (err){
          if(err){ 
              console.log('Not Able to Create Admin');
              console.log(err);
              // console.log(err.message);
              // console.log(err.name);
              process.exit(1);

          } else {
            console.log('Admin create');
            process.exit(1);

          }
        });
      } else {
        console.log('Admin Exist');
        process.exit(1);

      }  
    });
  }  
});
mongoose.set('debug', true);


