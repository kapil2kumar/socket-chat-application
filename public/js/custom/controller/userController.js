hospitalApp.controller('userController', function($scope,$window,$http,$location,auth) {
   
    if(auth.getToken() != null){
        var userDetail=auth.getUser();
        // console.log('userDetail',userDetail);
        if (userDetail.role == 'admin') {
            $location.path('/admin'); return false;
        } else if (userDetail.role == 'doctor') {
            $location.path('/doctor'); return false;
        } else if (userDetail.role == 'patient') {
            $location.path('/patient'); return false;
        } else {
            $location.path('/'); 
        }
    }

    $scope.message = '';
    $scope.userLogin = function() {
        $scope.message = '';
        $http.post('/login', $scope.login)
        .success(function(response) {
            if (response.status == true) {
                $scope.userData = response.user;
                $window.localStorage['userData']=$scope.userData;
                $scope.user=response.userData;
                // console.log($scope.user);
                if ($scope.user.role == 'admin') {
                    $location.path('/admin'); return false;
                } else if ($scope.user.role == 'doctor') {
                    $location.path('/doctor'); return false;
                } else if ($scope.user.role == 'patient') {
                    $location.path('/patient'); return false;
                } else {
                    $scope.message = response.message;
                }
            } else {
                $scope.message = response.message;
            }
        })
        .error(function(error) {
            console.log(error);
            $scope.message = error.message;
            
        });
    };
});