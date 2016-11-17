var app = angular.module('Multilingual', ['pascalprecht.translate','ngRoute','ngCookies','ngSanitize','btford.socket-io' ]);//i use ngSanitize to sanitize user input in case of rendering it



// configure our routes
app.config(['$translateProvider','$routeProvider' ,function($translateProvider,$routeProvider) {

  $translateProvider
  .useStaticFilesLoader({
    prefix: '/translations/', //'https://trixlabs.com/Fb/mysky/livetogive/translations/',
    suffix: '.json'
  })
  .preferredLanguage('en');

  $routeProvider

      // route for the index page
      .when('/', {
          templateUrl : 'views/home.html',
          controller  : 'MainController'
      })

      // route for the home page
      .when('/home', {
          templateUrl : 'views/home.html',
          controller  : 'MainController'
      })

      // route for the contact page
      .when('/login', {
          templateUrl : 'views/login.html',
          controller  : 'LoginController'
      })

      .when('/signup', {
          templateUrl : 'views/signup.html',
          controller  : 'SignupController'
      })

      .when('/2fa', {
          templateUrl : 'views/2fa.html',
          controller  : 'TwoFAController'
      })



      ;

}]);


// create the controller and inject Angular's $scope
app.controller('MainController', ['$scope','$http',function($scope,$http) {
  // get all users
  $http.get('/api/users')
      .then(function (response) {

         $scope.allUsers = response.data ;

      });

}]);


app.controller('TwoFAController', ['$rootScope','$scope','$http','$location','$cookieStore','socket','$timeout', function($rootScope,$scope,$http,$location,$cookieStore,socket,$timeout) {

         // init user authy id from globals (cookieStore)
        $scope.user_authy_id = $rootScope.globals.currentUser.authy_id ;
        // register a new user on Authy and get Authy iD
        $scope.adduser_authy = function(){
            $scope.dataLoading = true;
            $http.get('/api/adduser_authy',{params: { email:$rootScope.globals.currentUser.username,countrycode: $scope.countrycode,phone:$scope.phone }})
                .then(function (response) {
                   //alert(JSON.stringify(response));
                   if(response.data.user && response.data.user.id){
                     $scope.user_authy_id = response.data.user.id;
                     $rootScope.globals.currentUser.authy_id = $scope.user_authy_id ;

                     sendOneTouch();// send OneTouch request after registration
                   }
                });
        }
        // verify a user token send to Authy Mobile App
        $scope.verify_token = function(){
            $scope.dataLoading=true;
            $http.get('/api/verify_token_authy',{params: { authy_id:$rootScope.globals.currentUser.authy_id,token: $scope.token }})
                .then(function (response) {
                   //alert(JSON.stringify(response));
                   if(response.data.success){

                     $rootScope.globals.currentUser.isvalid = true;
                     $cookieStore.put('globals', $rootScope.globals);
                     $location.path('/home');
                   }else{
                     $scope.tokenText= "Invalid Token";
                   }
                   $scope.dataLoading=false;

                });
        }


        // if already registered on Authy
        if($rootScope.globals.currentUser.authy_id)
        sendOneTouch();

        function sendOneTouch(user){
          $scope.dataLoading=true;
          $scope.waitingApproval = true ;
          $http.get('/api/onetouch_authy',{params: { authy_id:$rootScope.globals.currentUser.authy_id,email: $rootScope.globals.currentUser.username }})
              .then(function (response) {

                 if(response.data){
                    // here i could only save the UUID Transaction approved from OneTouch
                    $scope.UUID = response.data ;
                    $rootScope.globals.currentUser.uuid = $scope.UUID ;
                   //$rootScope.globals.currentUser.isvalid = true;
                   //$cookieStore.put('globals', $rootScope.globals);
                   //$location.path('/home');
                   $scope.dataLoading=false;
                 }

              });
        }
        //Listen OneTouch socket
        socket.on('onetouch', function (data) {
              //alert("onetouch socket message "+JSON.stringify(data));
              $scope.waitingApproval = false ;
              if(data.status == 'approved' ) {

                $rootScope.globals.currentUser.isvalid = true;
                $cookieStore.put('globals', $rootScope.globals);
                $scope.onetouchApproved = true;
                $timeout(function () { // redirect to home and logged in the user
                    $location.path('/home');
                }, 2000);
              }else{
                $scope.onetouchDenied = true;
              }
         });

}]);



app.controller('SignupController', ['$scope','$http','$location', function($scope,$http,$location  ) {

  $scope.register = function() {

            $scope.dataLoading = true;
            // call REST api to add new user
            $http.post('/api/users',{user:$scope.user})
                  .then(function (response) {

                      if (response.data.success) {

                          $location.path('/login');

                      } else {

                          $scope.errorText = response.data.status;
                          $scope.dataLoading = false;
                      }
                  });
          }

}]);

// Controller for the login
app.controller('LoginController', ['$rootScope','$scope','$http','$cookieStore','$location','socket', function($rootScope,$scope,$http,$cookieStore ,$location, socket) {

       $scope.login = function(){

           $http.get('/api/user',{params: { username: $scope.username,password:$scope.password }})
               .then(function (response) {
                  //alert(JSON.stringify(response));
                   if (response.data.length > 0) {
                      var user = response.data[0]; // only 1 element supposed to be

                      SetCredentials(user);


                      // go to enable Two-Factor Authentication (SoftToken + OneTouch)
                      $location.path('/2fa');

                   } else {
                     //  FlashService.Error(response.message);
                       dataLoading = false;
                       $scope.errorText = "Invalid Username or Password";
                   }
               });
       }



      // reset login status
      ClearCredentials();




       function SetCredentials(user) {
            var username = user.username;
            var password = user.password;
            var fullname = user.firstname+" "+user.lastname
            var authdata = Base64.encode(username + ':' + password);
            var authyId  = user.authyid ;

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    fullname: fullname,
                    authy_id: authyId,
                    authdata: authdata
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        }

        function ClearCredentials() {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic';
        }

        // Create Base64 Object
        var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}



}]);


//Service to interact with the socket library
app.factory('socket',['socketFactory', function (socketFactory) {

    var serverBaseUrl ='';
    var myIoSocket = io.connect(serverBaseUrl);

    var socket = socketFactory({
        ioSocket: myIoSocket
    });

    return socket;
}]);




app.run(['$rootScope','$location','$cookieStore','$http',function($rootScope,$location,$cookieStore,$http ) {
  // language setting properties
  $rootScope.lang = 'en';

  $rootScope.default_float = 'left';
  $rootScope.opposite_float = 'right';

  $rootScope.default_direction = 'ltr';
  $rootScope.opposite_direction = 'rtl';

  // keep user logged in after page refresh
  $rootScope.globals = $cookieStore.get('globals') || {};
  if ($rootScope.globals.currentUser) {
    $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
  }

  $rootScope.$on('$locationChangeStart', function (event, next, current) {

           // redirect to login page if not logged in and trying to access a restricted page
           var restrictedPage = $.inArray($location.path(), ['/login', '/signup','/2fa']) === -1;
           var loggedIn = $rootScope.globals.currentUser && $rootScope.globals.currentUser.isvalid ;


           if (restrictedPage && !loggedIn) {

               $location.path('/login');
           }
       });

}]);

app.controller('LanguageSwitchController', ['$scope', '$rootScope', '$translate',
  function($scope, $rootScope, $translate) {
    $scope.changeLanguage = function(langKey) {
      $translate.use(langKey);
    };

    $rootScope.$on('$translateChangeSuccess', function(event, data) {
      var language = data.language;

      $rootScope.lang = language;

      $rootScope.default_direction = language === 'ar' ? 'rtl' : 'ltr';
      $rootScope.opposite_direction = language === 'ar' ? 'ltr' : 'rtl';

      $rootScope.default_float = language === 'ar' ? 'right' : 'left';
      $rootScope.opposite_float = language === 'ar' ? 'left' : 'right';

      //alert("translateChangeSuccess");
    });
}]);
