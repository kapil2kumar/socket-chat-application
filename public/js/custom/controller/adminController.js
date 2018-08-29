hospitalApp.controller('adminController', function($scope,$window,$http,$location,auth,mySocket) {
   
    if(auth.getToken() == null){
        $location.path('/'); 
    }
    $scope.message = '';
    $scope.addUserFormShow=false;
    $scope.updateUserFormShow=false;
    $scope.addUserLable="";
    $scope.updateUserLable="";

    $scope.doctorList=[];
    $scope.patientList=[];

    var headers =  {
        'Authorization': auth.getToken(),
        'Accept': 'application/json'
    };
    console.log(headers);


    $scope.getDoctorList = function() {
        $scope.message = '';

        var req = {
         method: 'POST',
         url: '/doctorList',
         headers : headers
        }

        $http(req).then(function(response){
            console.log(response);
            if (response.data.status == true) {
                $scope.doctorList=response.data.data;
            } else {
                $scope.message = response.data.message;
            }
        }, function(error){
            console.log(error);
            $scope.message = error.data.message;
            auth.isAuthenticated(error);

        });
    };

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
            console.log(error);
            $scope.message = error.data.message;
            auth.isAuthenticated(error);

        });
    };

    $scope.getDoctorList();
    $scope.getPatientList();

    $scope.add={};
    $scope.update={};
    $scope.addUser = function(type) {
        $scope.addUserFormShow=true;
        $scope.add.role=type;
        $scope.addUserLable="ADD "+type.toUpperCase();
    };

    $scope.userAdd = function() {
        console.log($scope.add);
        var req = {
         method: 'POST',
         url: '/addUser',
         headers : headers,
         data:$scope.add
        }
        $http(req).then(function(response){
            // console.log(response);
            if (response.data.status == true) {
                $scope.message = response.message;
                $scope.addUserFormShow=false;
                if ($scope.add.role == 'doctor') {
                    $scope.getDoctorList();
                } else {
                    $scope.getPatientList();
                }
                $scope.add={};
            } else {
                $scope.message = response.data.message;
            }
        }, function(error){
            console.log(error);
            $scope.message = error.data.message;
            auth.isAuthenticated(error);

        });
    };

    $scope.editUser = function(_id,type) {
        // console.log('sdfghjuio')
        $scope.message = '';
        var req = {
         method: 'GET',
         url: '/viewUser?_id='+_id,
         headers : headers,
        }
        $http(req).then(function(response){
            if (response.data.status == true) {
                $scope.updateUserFormShow=true;
                $scope.addUserFormShow=false;
                $scope.update=response.data.data;
            } else {
                $scope.message = response.data.message;
            }
        }, function(error){
            console.log(error);
            $scope.message = error.data.message;
            auth.isAuthenticated(error);

        });
    };

    $scope.userUpdate = function() {
        console.log($scope.update);
        var req = {
         method: 'POST',
         url: '/updateUser',
         headers : headers,
         data:$scope.update
        }
        $http(req).then(function(response){
            // console.log(response);
            if (response.data.status == true) {
                $scope.message = response.data.message;
                $scope.updateUserFormShow=false;
                if ($scope.update.role == 'doctor') {
                    $scope.getDoctorList();
                } else {
                    $scope.getPatientList();
                }
                $scope.update={};
            } else {
                $scope.message = response.data.message;
            }
        }, function(error){
            console.log(error);
            $scope.message = error.data.message;
            auth.isAuthenticated(error);

        });
    };

    $scope.deleteUser = function(_id,type) {
        $scope.message = '';
        var req = {
         method: 'DELETE',
         url: '/deleteUser?_id='+_id,
         headers : headers,
        }
        $http(req).then(function(response){
            if (response.data.status == true) {
                if (type == 'doctor') {
                    $scope.getDoctorList();
                } else {
                    $scope.getPatientList();
                }
            } else {
                $scope.message = response.data.message;
            }
        }, function(error){
            console.log(error);
            $scope.message = error.data.message;
            auth.isAuthenticated(error);
        });
    };

    mySocket.socket.on('auth_response',function(authResponse) {
      authResponse=JSON.parse(authResponse);
      console.log('authResponse',authResponse);
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

    $scope.onlineUser=[];
    mySocket.socket.on('user/online:list',function(onlineUserList) {
        onlineUserList=JSON.parse(onlineUserList);
        $scope.onlineUser=onlineUserList.onlineUser;
    });

    mySocket.socket.on('user/online:update',function(onlineUpdateUser) {
        onlineUpdateUser=JSON.parse(onlineUpdateUser);
        var updateUser=onlineUpdateUser.data;
        for (var i = 0; i < $scope.onlineUser.length; i++) {
          if ($scope.onlineUser[i]._id == updateUser._id) {
              $scope.onlineUser[i]=updateUser;
          }
        }
        if (updateUser.status=='online') {
            $scope.onlineUser.push(updateUser);
        }
    });

    $scope.showChatDiv=false;
    $scope.send_msg={};
    $scope.chatMessage=[];
    $scope.chatStart = function(reciver_user,reciver_name) {
        $scope.chatMessage=[];
        $scope.showChatDiv=true;
        $scope.send_msg.sender_user=auth.getUser();
        $scope.send_msg.receiver_user=reciver_user;
    };


    $scope.sendMessage = function() {
        console.log($scope.send_msg);
        $scope.chatMessage.push({msg:$scope.send_msg.msg,name:'You'});
        //send socket
        mySocket.socket.emit('message:send', JSON.stringify($scope.send_msg));
        $scope.send_msg.msg="";
    };

    mySocket.socket.on('message:receive',function(messageRecive) {
        messageRecive=JSON.parse(messageRecive);
        if (!$scope.showChatDiv) {
            $scope.showChatDiv=true;    
        }
        $scope.chatMessage.push(messageRecive);
    });
    
});