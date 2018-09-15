hospitalApp.controller('doctorController', function($scope,$window,$http,$location,auth,mySocket) {
   
    if(auth.getToken() == null){
        $location.path('/'); 
    }
    $scope.message = '';
    
    $scope.patientList=[];

    var headers =  {
        'Authorization': auth.getToken(),
        'Accept': 'application/json'
    };
    // console.log(headers);


    $scope.getPatientList = function() {
        $scope.message = '';
        var req = {
         method: 'POST',
         url: '/patientList',
         headers : headers
        }
        $http(req).then(function(response){
            // console.log(response);
            if (response.data.status == true) {
                $scope.patientList=response.data.data;
            } else {
                $scope.message = response.data.message;
            }
        }, function(error){
            // console.log(error);
            $scope.message = error.data.message;
            auth.isAuthenticated(error);
        });
    };

    $scope.getPatientList();

    mySocket.socket.on('auth_response',function(authResponse) {
      authResponse=JSON.parse(authResponse);
      // console.log('authResponse',authResponse);
      if (authResponse.status !=true) {
        mySocket.disconnect();
        console.log('disconnected');
      }
    });

    mySocket.socket.on('disconnect',function() {
      console.log('disconnect to the server..!');
    });

    mySocket.socket.on('error',function(err) {
      console.log('Error      => '+ err);
    });

    mySocket.socket.on('connect_error',function(err) {
      console.log('Unable to connect to the server..!');
      console.log('Connection Error      => '+ err);
    });

    // $scope.onlineUser=[];
    // mySocket.socket.on('user/online:list',function(onlineUserList) {
    //     onlineUserList=JSON.parse(onlineUserList);
    //     $scope.onlineUser=onlineUserList.onlineUser;
    // });

    // mySocket.socket.on('user/online:update',function(onlineUpdateUser) {
    //     onlineUpdateUser=JSON.parse(onlineUpdateUser);
    //     var updateUser=onlineUpdateUser.data;
    //     for (var i = 0; i < $scope.onlineUser.length; i++) {
    //       if ($scope.onlineUser[i]._id == updateUser._id) {
    //           $scope.onlineUser[i]=updateUser;
    //       }
    //     }
    //     if (updateUser.status=='online') {
    //         $scope.onlineUser.push(updateUser);
    //     }
    // });

    // $scope.showChatDiv=false;
    // $scope.send_msg={};
    // $scope.chatMessage=[];
    // $scope.chatStart = function(reciver_user,reciver_name) {
    //     $scope.chatMessage=[];
    //     $scope.showChatDiv=true;
    //     $scope.send_msg.sender_user=auth.getUser();
    //     $scope.send_msg.receiver_user=reciver_user;
    // };


    // $scope.sendMessage = function() {
    //     // console.log($scope.send_msg);
    //     $scope.chatMessage.push({msg:$scope.send_msg.msg,name:'You'});
    //     //send socket
    //     mySocket.socket.emit('message:send', JSON.stringify($scope.send_msg));
    //     $scope.send_msg.msg="";
    // };

    // mySocket.socket.on('message:receive',function(messageRecive) {
    //     messageRecive=JSON.parse(messageRecive);
    //     if (!$scope.showChatDiv) {
    //         $scope.showChatDiv=true;    
    //     }
    //     $scope.chatMessage.push(messageRecive);
    // });

    $scope.onlineUser=[];
    mySocket.socket.on('user/online:list',function(onlineUserList) {
        onlineUserList=JSON.parse(onlineUserList);
        $scope.onlineUser=onlineUserList.onlineUser;

        for (var i = 0; i < $scope.onlineUser.length; i++) {
            $scope.onlineUser[i].showChatDiv=false;
            $scope.onlineUser[i].send_msg={
                sender_user:auth.getUser(),
                receiver_user:"",
                msg:""
            };
        }
    });
    
    mySocket.socket.on('user/online:update',function(onlineUpdateUser) {
        onlineUpdateUser=JSON.parse(onlineUpdateUser);
        var updateUser=onlineUpdateUser.data;
        var exist=false;
        for (var i = 0; i < $scope.onlineUser.length; i++) {
          if ($scope.onlineUser[i]._id == updateUser._id) {
            updateUser.showChatDiv=false;
            updateUser.send_msg={
                sender_user:auth.getUser(),
                receiver_user:updateUser._id,
                msg:""
            };
            $scope.onlineUser[i]=updateUser;
            exist=true;
            $scope.onlineUser.splice(i, 1);
            break;
          }
        }
        if(exist == false){
            if (updateUser.status=='online') {
                updateUser.showChatDiv=false;
                updateUser.send_msg={
                    sender_user:auth.getUser(),
                    receiver_user:updateUser._id,
                    msg:""
                };
                $scope.onlineUser.push(updateUser);
            }
        }
        
    });

    $scope.chatMessage=[];
    $scope.chatStart = function(reciver_user,reciver_name) {
        for (var i = 0; i < $scope.onlineUser.length; i++) {
            if ($scope.onlineUser[i]._id == reciver_user) {
                $scope.onlineUser[i].showChatDiv=true; 
                $scope.onlineUser[i].send_msg={
                    sender_user:auth.getUser(),
                    receiver_user:reciver_user,
                    msg:""
                };
                break;
            }
        }
    };


    $scope.sendMessage = function(chatWindowId) {
        console.log(chatWindowId);
        console.log($scope.onlineUser);
        for (var i = 0; i < $scope.onlineUser.length; i++) {
            if ($scope.onlineUser[i]._id == chatWindowId) {
                $scope.chatMessage.push({_id:chatWindowId,msg:$scope.onlineUser[i].send_msg.msg,name:'You'});
                //send socket
                mySocket.socket.emit('message:send', JSON.stringify($scope.onlineUser[i].send_msg));
                $scope.onlineUser[i].send_msg.msg="";
                break;
            }
        }

        
    };

    mySocket.socket.on('message:receive',function(messageRecive) {
        messageRecive=JSON.parse(messageRecive);
        console.log(messageRecive);
        for (var i = 0; i < $scope.onlineUser.length; i++) {
            if ($scope.onlineUser[i]._id == messageRecive._id) {
                $scope.onlineUser[i].showChatDiv=true; 
                $scope.onlineUser[i].send_msg={
                    sender_user:auth.getUser(),
                    receiver_user:messageRecive._id,
                    msg:""
                };
                $scope.chatMessage.push({_id:messageRecive._id,msg:messageRecive.msg,name:messageRecive.name});
                break;
            }
        }
    });
   
});