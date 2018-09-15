var hospitalApp = angular.module('hospitalApp', ['ngRoute','btford.socket-io']);

hospitalApp.config(function($routeProvider) {
$routeProvider
    // route for the home page
    .when('/', {
        templateUrl : 'login.html',
        controller  : 'userController',
        title: 'Demo Hospital'
    })
    .when('/admin', {
        templateUrl : 'admin.html',
        controller  : 'adminController',
        title: 'Demo Hospital'
    })
    .when('/doctor', {
        templateUrl : 'doctor.html',
        controller  : 'doctorController',
        title: 'Demo Hospital'
    })
    .when('/patient', {
        templateUrl : 'patient.html',
        controller  : 'patientController',
        title: 'Demo Hospital'
    })
    .otherwise({redirectTo:'/'});
});

hospitalApp.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);

hospitalApp.factory('mySocket', function ($window,$location,socketFactory) {
    // console.log($location);
    var host=location.host;
    var port=location.port;
    var hostUrl='http://'+host;
    console.log(hostUrl);
    var myIoSocket = io.connect(hostUrl);  
    myIoSocket.on('connect', function () {
        console.log('connect');
    });
    
    var token=$window.localStorage['userData'];
    if (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        LoginUser=JSON.parse(window.atob(base64));
        var authenticate = JSON.stringify({"token" : token,"_id" : LoginUser._id,"role": LoginUser.role,"name": LoginUser.name});
        console.log('authenticate',authenticate);
        myIoSocket.emit('authentication', authenticate);    
    } else {
        console.log('token not found');
        // myIoSocket.destroy();   
        // $window.location.reload();

    }
    
    var socket = socketFactory({
        ioSocket: myIoSocket
    });
    this.reConnect = function (){
        var myIoSocket = io.connect(baseURL);
        myIoSocket.on('connect', function () {

        });
        var token=$window.localStorage['userData'];
        if (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            LoginUser=JSON.parse(window.atob(base64));
            var authenticate = JSON.stringify({"token" : token,"_id" : LoginUser._id,"role": LoginUser.role,"name": LoginUser.name});
            myIoSocket.emit('authentication', authenticate);    
        }
    }
    this.disconnect = function (){
        // myIoSocket.emit('socket:disconnect',JSON.stringify({}));
        myIoSocket.destroy();   
        $window.location.reload();

        // myIoSocket.destroy();
    }
    return {
        socket: socket,
        reconnect: this.reConnect,
        disconnect:this.disconnect,
        myIoSocket: myIoSocket
    };
});







  
