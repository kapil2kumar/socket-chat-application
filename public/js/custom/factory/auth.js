hospitalApp.factory('auth', function($window,$location){
  var o = {
  };

   o.getToken = function (){
    //console.log(JSON.parse($window.localStorage['userData']));
    return $window.localStorage['userData'];
  }

  o.getUser = function (){
    if ($window.localStorage['userData']) {
    	var token=$window.localStorage['userData'];
	    var base64Url = token.split('.')[1];
	    var base64 = base64Url.replace('-', '+').replace('_', '/');
	    LoginUser=JSON.parse(window.atob(base64));
	    return LoginUser;
    } else {
    	return null;
    }
  }

  o.getName = function (){
  	if ($window.localStorage['userData']) {
    	var token=$window.localStorage['userData'];
	    var base64Url = token.split('.')[1];
	    var base64 = base64Url.replace('-', '+').replace('_', '/');
	    LoginUser=JSON.parse(window.atob(base64));
	    return LoginUser.name+"  "+LoginUser.email;
    } else {
    	return null;
    }
  }


	o.isAuthenticated = function(errorData){
		if ($window.localStorage['userData']) {
			if (errorData.status == 401) {
				console.log(errorData.data.message);
				$window.localStorage.removeItem('userData');
        		$location.path('/'); 
			} else {
				return true;
			}
		} else {
			$location.path('/'); 
		}
	};

  o.logOut = function(){
        $window.localStorage.removeItem('userData');
        $location.path('/'); 
  };
  return o;
    
 }); 