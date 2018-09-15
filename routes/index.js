var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var validate = require('express-jsonschema').validate;
var jwt = require('jsonwebtoken');
var path = require('path');
var schemaValidation = require( path.resolve( __dirname, 'variables/schemaValidation' ) );
var mongoose = require('mongoose');
var User = require('../models/Users');
var validator = require('validator');


var isAuthenticated = function (req, res, next) {
    var token = req.headers['authorization'];
    try {
    var decoded = jwt.verify(token, 'RS512');
    next();
  } catch (err) {
    res.status(401).json({status:false,message: 'Unauthorized!'});
  }
};


exports.route_apis = function (app) {
    /* GET home page. */
    // app.get('/', function(req, res, next) {
    //   res.render('index',);
    // });


    app.post('/login',validate({body:schemaValidation.login}), function(req, res, next) {
        var email = req.body.email;
        var password = crypto.createHash('md5').update(req.body.password).digest("hex");
        var where={email:email};
        User.findOne(where, function (err, user) {
          if (err) { 
            console.log(err);
            return res.status(400).json({status:false,message: 'Invalid User'});
          }
          if (!user) {
            return res.status(400).json({status:false,message: 'Invalid Email'});
          } else {
            if(user.password != password){
              return res.status(400).json({status:false,message: 'Invalid Password'});
            } else {
              delete user.password;
              var token = jwt.sign({
                _id: user._id,
                name: user.name,
                email:user.email,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 86400,
                message: 'valid token'
              }, 'RS512');
              user['token']=token;
              switch(user.role){
                case 'admin':
                  res.status(200).json({status:true,message: 'Success',user:token,userData:user});
                  break;
                case 'doctor':
                  res.status(200).json({status:true,message: 'Success',user:token,userData:user});
                  break;
                case 'patient':
                  res.status(200).json({status:true,message: 'Success',user:token,userData:user});
                  break;
                default:
                  res.status(400).json({status:false,message: 'Invalid Email'});
                  break;
              }
            }
          }  
        });
    });


    app.post('/doctorList', isAuthenticated,function(req, res, next) {
        
        var where={role:'doctor'};
        var query = User.find(where);
        // selecting the `name` and `occupation` fields
        query.select('name email role _id');
        // execute the query at a later time
        query.sort('-_id');
        query.exec(function (err, data) {
          if (err){
              console.log(err);
            return res.status(400).json({status:false,message: 'Error',err:err.message});
          } else {
            return res.status(200).json({status:true,message: 'Success',data:data});
          }
        });
    });

    app.post('/patientList', isAuthenticated,function(req, res, next) {
        var where={role:'patient'};
        var query = User.find(where);
        // selecting the `name` and `occupation` fields
        query.select('name email role _id');
        // execute the query at a later time
        query.sort('-_id');
        query.exec(function (err, data) {
          if (err){
              console.log(err);
            return res.status(400).json({status:false,message: 'Error',err:err.message});
          } else {
            return res.status(200).json({status:true,message: 'Success',data:data});
          }
        });

    });

    app.post('/addUser', isAuthenticated,validate({body:schemaValidation.addUser}),function(req, res, next) {
        
        if(!req.body.name){
          return res.status(400).json({status:false,message: 'Please fill out name'});
        }
        if(!req.body.email){
          return res.status(400).json({status:false,message: 'Please fill out email'});
        }
        if (!validator.isEmail(req.body.email)) {
          return res.status(400).json({status:false,message: 'Please enter valid email'});

        }
        if(!req.body.password){
          return res.status(400).json({status:false,message: 'Please fill out password'});
        }

        if(!req.body.role){
          return res.status(400).json({status:false,message: 'Please fill out role'});
        }

        User.findOne({ email: req.body.email }, function (err, user) {  //validate
          if (err) { 
            console.log(err);
            return res.status(500).json({status:false,message: 'Somethin want worng!'});
          } else {
            if (user) {
              return res.status(400).json({status:false,message: 'Email already exist'});
            } else {
              //register user 
              var user_save = new User();
              user_save.name = req.body.name;
              user_save.email = req.body.email;
              user_save.password=crypto.createHash('md5').update(req.body.password).digest("hex");
              user_save.role = req.body.role;
              user_save.save(function (err,userSave){
                if(err){
                  console.log(err);
                  return res.status(500).json({status:false,message: 'Somethin want worng!'});
                }
                res.status(200).json({status:true,user:userSave});
              });
            }
          } //end of else validate email    
        });

    });

    app.get('/viewUser',isAuthenticated,function(req, res, next) {
        if(!req.query._id){
          return res.status(400).json({message: 'Invalid User'});
        }
        var where={_id:req.query._id};
        var query = User.findOne(where);
        // selecting the `name` and `occupation` fields
        query.select('name email role _id');
        // execute the query at a later time
        query.exec(function (err, data) {
          if (err){
              console.log(err);
            return res.status(400).json({status:false,message: 'Error',err:err.message});
          } else {
            return res.status(200).json({status:true,message: 'Success',data:data});
          }
        });
    });

    app.post('/updateUser', isAuthenticated,validate({body:schemaValidation.editUser}),function(req, res, next) {
        
        if(!req.body._id){
          return res.status(400).json({status:false,message: 'Invalid User'});
        }

        if(!req.body.name){
          return res.status(400).json({status:false,message: 'Please fill out name'});
        }
        if(!req.body.email){
          return res.status(400).json({status:false,message: 'Please fill out email'});
        }
        if (!validator.isEmail(req.body.email)) {
          return res.status(400).json({status:false,message: 'Please enter valid email'});

        }
        // if(!req.body.password){
        //   return res.status(400).json({message: 'Please fill out password'});
        // }

        if(!req.body.role){
          return res.status(400).json({status:false,message: 'Please fill out role'});
        }

        User.findOne({ email: req.body.email }, function (err, user) {  //validate
          if (err) { 
            console.log(err);
            return res.status(500).json({status:false,message: 'Somethin want worng!'});
          } else {
            if (!user) {
              return res.status(400).json({status:false,message: 'Invalid User'});
            } else {
              User.findOne({ email: req.body.email,_id:{$ne:req.body._id} }, function (err, user) {  //validate
              if (err) { 
                console.log(err);
                return res.status(500).json({status:false,message: 'Somethin want worng!'});
              } else {
                if (user) {
                  return res.status(400).json({status:false,message: 'Email already exist'});
                } else {
                  var conditions = { _id: req.body._id };
                  var updateData={
                    name: req.body.name,
                    email: req.body.email,
                    // password: crypto.createHash('md5').update(req.body.password).digest("hex"),
                    role: req.body.role,
                  }
                  User.update(conditions, { $set: updateData}, function(err, userUpdate) {
                    if(err){
                      console.log(err);
                      return res.status(500).json({status:false,message: 'Somethin want worng!'});
                    }
                    res.status(200).json({status:true,user:userUpdate});
                  });
                }
              } //end of else validate email    
            });
            }
          }
        });
    });

    app.delete('/deleteUser',isAuthenticated,function(req, res, next) {
        if(!req.query._id){
          return res.status(400).json({message: 'Invalid User'});
        }
        var where={_id:req.query._id};
        var query = User.findOne(where);
        // selecting the `name` and `occupation` fields
        query.select('name email role _id');
        // execute the query at a later time
        query.exec(function (err, data) {
          if (err){
              console.log(err);
            return res.status(400).json({status:false,message: 'Error',err:err.message});
          } else {
            if (data) {
              User.remove({_id:req.query._id}, function (err, todo){
                if (err) { 
                  return res.status(400).json({status:false,message: 'Error',err:err.message});
                } else {
                  return res.status(200).json({status:true,message: 'Success',data:data});
                }
              });
            } else {
              return res.status(200).json({status:false,message: 'Invalid User',data:data});
            }
          }
        });
    });

    app.get('/logout', function(req, res, next) {
        res.status(200).json({status:true,message: 'Success'});
        // res.render('index', { title: 'Demo Project',error_message:""});
    });

};



/* socket functionality */
var socketVar=null;
var clients         = {};
var socketIdList =[];

    //app.js socket_module
exports.socket_module=function(io){
    console.log('Socket Module');
    io.on('connection', function(socket){

        var socketID        = socket.id;
        // var conneactionData         = {"socket_id":socketID,"type":"authnitication"};
        socket.on('authentication',function(authData){
            var message="";
            var payload          = JSON.parse(authData);
            var token=payload.token;
            var _id=payload._id;
            var role=payload.role;
            var name=payload.name;
            var verify=0;
            try {
                var decoded = jwt.verify(token, 'RS512');
                verify=1;
            } catch (err) {
                message="Authnticate Fail, Invalid Token";
                callback(message);
                sendSocketData(false,message,'','',function (socketResData) {
                    socket.emit('auth_response',socketResData);    
                });
                // delete clients[adminId];
            }
            if (verify ==1) {
                removeExistingSocketOfAdmin(_id,function(){
                    // console.log(decoded);
                    var date = new Date().toString();
                    message="Authnticate Success";
                    clients[_id]        = socket;
                    var obj={};
                    obj[socket.id]={_id:_id,role:role,name:name,status:'online'};
                    socketIdList.push(obj);
                    clients[_id].emit('auth_response',JSON.stringify({message:message,status:true})); 
                    console.log("New socket client [ "+socketID+" ] request at "+ date +" Authentication response:->"+message);
                    console.log('clients',Object.keys(clients));
                    console.log('socketIdList',socketIdList);
                    getOnlineUser(role,function(onlineUser){
                      console.log('onlineUser',onlineUser);
                      var data={'status':true,'onlineUser':onlineUser};
                      clients[_id].emit('user/online:list',JSON.stringify(data));    
                    });

                    updateOnlineUserofOnlineClients(role,{_id:_id,role:role,name:name,status:'online'},function(message){
                      console.log(message);
                    });

                });
            }
        });
        
        socket.on('message:send',function(messageSend){
            var messageSend          = JSON.parse(messageSend);
            var receiver_user=messageSend.receiver_user;
            var msg=messageSend.msg;
            // console.log('message:send','messageSend.sender_user',messageSend.sender_user);

            var sender_user_name=messageSend.sender_user.name;
            var sender_user_id=messageSend.sender_user._id;

            console.log('message:send','messageSend',messageSend);
            //get socket id of reciver
            getMessageReciverSocketId(receiver_user,function(socketid){
              if (socketid) {
                console.log('message:receive','receive',{_id:sender_user_id,msg:msg,name:sender_user_name});
                clients[socketid].emit('message:receive',JSON.stringify({_id:sender_user_id,msg:msg,name:sender_user_name}));    
              }
            });           
        });

        socket.on('socket:disconnect', function(){
            console.log('disconnect');
            removeSocketClient(socket, function (disconnectUser,message) {
                var date = new Date().toString();
                console.log("socket client disconnect [ "+socketID+" ]  at "+ date +" Status :->"+message);
                if (disconnectUser._id) {
                  disconnectUser.status='offline';
                  updateOnlineUserofOnlineClients(disconnectUser.role,disconnectUser,function(message){
                    console.log(message);
                  });  
                }
            });
        });

        socket.on('disconnect', function(){
            console.log('disconnect');
            removeSocketClient(socket, function (disconnectUser,message) {
                var date = new Date().toString();
                console.log("socket client disconnect [ "+socketID+" ]  at "+ date +" Status :->"+message);
                if (disconnectUser._id) {
                  disconnectUser.status='offline';
                  updateOnlineUserofOnlineClients(disconnectUser.role,disconnectUser,function(message){
                    console.log(message);
                  });  
                }
                
            });
        });
        
    });
};


var removeExistingSocketOfAdmin   = function (_id,callback) {
    for (var i = 0; i < socketIdList.length; i++) {
        var key = Object.keys(socketIdList[i]);
        if (key[0]) {
            var socketId = key[0];
            var user= socketIdList[i][socketId];
            if (_id == user._id) {
                delete socketIdList[i][socketId];
                socketIdList.splice(i, 1);

                // clients[adminId].disconnect();
                // delete clients[adminId];
                break;
            }
        }
    }
    callback();
};


var removeSocketClient = function (socket,callback) {
    var socketId=socket.id;
    var mapLength=socketIdList.length;
    var removeStatus=false;
    // console.log(socketIdList);
    var disconnectUser={};
    for(var q=0;q<mapLength;q++){
        var socketMap=socketIdList[q];
        var keys=Object.keys(socketMap);
        var key=keys[0];
        var val=socketMap[key];
        if(key===socketId){
            delete clients[val];
            socketIdList.splice(q, 1);
            removeStatus=true;
            disconnectUser=val;
            break;
        }
    }
    if (removeStatus) {
        var message="socket client remove success";
    } else {
        var message="socket client not found";
    }
    callback(disconnectUser,message);
    // console.log(socketIdList);
};


var getOnlineUser = function (role,callback) {
    var onlineUser=[];
    var mapLength=socketIdList.length;
    for(var q=0;q<mapLength;q++){
        var socketMap=socketIdList[q];
        var keys=Object.keys(socketMap);
        var key=keys[0];
        var val=socketMap[key];
        // console.log('val-->getOnlineUser:::',val);
        // console.log('role-->getOnlineUser:::',role);
        if (role == 'admin') {
            if (val.role != 'admin') {
              onlineUser.push(val);
            }
        } else if (role == 'doctor'){
            if (val.role != 'doctor') {
              onlineUser.push(val);
            }
        } else if (role == 'patient'){
            if (val.role != 'patient') {
              onlineUser.push(val);
            }
        }
    }
    callback(onlineUser);
};


var updateOnlineUserofOnlineClients = function (role,data,callback) {
    var updateUser=[];
    var mapLength=socketIdList.length;

    for(var q=0;q<mapLength;q++){
        var socketMap=socketIdList[q];
        var keys=Object.keys(socketMap);
        var key=keys[0];
        var val=socketMap[key];

        // console.log('key',key);
        // console.log('val',val);

        if (val.role == 'admin') {
          if (role != 'admin') {
            var decoded={'status':true,'data':data};
            clients[val._id].emit('user/online:update',JSON.stringify(decoded)); 
            updateUser.push(val);     
          }
        } else if (val.role == 'doctor') {
          if (role != 'doctor') {
            var decoded={'status':true,'data':data};
            clients[val._id].emit('user/online:update',JSON.stringify(decoded));  
            updateUser.push(val);     
          }
        } else if (val.role == 'patient') {
          if (role != 'patient') {
            var decoded={'status':true,'data':data};
            clients[val._id].emit('user/online:update',JSON.stringify(decoded)); 
            updateUser.push(val);          
          }
        }
    }
    callback(updateUser);
};


var getMessageReciverSocketId   = function (_id,callback) {
    var socketIdCallback="";
    for (var i = 0; i < socketIdList.length; i++) {
        var key = Object.keys(socketIdList[i]);
        if (key[0]) {
            var socketId = key[0];
            var user= socketIdList[i][socketId];
            if (_id == user._id) {
                socketIdCallback=user._id;
                break;
            }
        }
    }
    callback(socketIdCallback);
};