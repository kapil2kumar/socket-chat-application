hospitalApp.controller('AuthCtrl', function($scope,$window,$location,auth,mySocket){

  $scope.getToken = function (){
    return auth.getToken();
  }

  $scope.getName = function (){
    return auth.getName();
  };

   $scope.getUser = function (){
    return auth.getUser();
  };

  $scope.logOut = function(){
    $window.localStorage.removeItem('userData');
    mySocket.disconnect();
    $location.path('/'); 
  };

});