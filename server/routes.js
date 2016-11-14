var config = require('../config');
var bodyParser = require('body-parser');
var onetouch = require('./onetouch');
var sanitizer = require('sanitize')();
// crypt using crypto //////////////
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = '3zTvzr3p67VC61jmV54rIYu1545x4TlY';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
/////////////////////////////////

var authy = require('authy')(config.authyApiKey);

var poolconnect ;
module.exports = function (app,pool) {

    // api ---------------------------------------------------------------------
    // set database pool
    poolconnect = pool ;
    // get all users
    app.get('/api/users', function (req, res) {
        // use mysql to get all users in the database
        pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("select * from user",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }
        });

        connection.on('error', function(err) {
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;
        });
      });
    });

    // create user
    app.post('/api/users', function (req, res) {

        // create a user, information comes from AJAX request from Angular
        var objectParam = req.body;

        var user =   objectParam.user ;

        // sanitize  values from user input

        var firstname = sanitizer.value(user.firstName, 'str');
        var lastname  = sanitizer.value(user.lastName, 'str');
        var username  = sanitizer.value(user.username, 'email');

        console.log(" firstname sanitized :"+firstname);



        pool.getConnection(function(err,connection){
          if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
          }
          // encrypt password before saving it in DB

          var hash_password = encrypt(user.password);
          //console.log(hash_password);

          connection.query("select * from `user` where `username`='"+username+"'",function(err,rows){
            //  connection.release();
              if(!err) {
                   if(rows.length){
                    res.json({"code" : 120, "status" : "User already exists"});
                    connection.release();
                    console.log("User already exists");
                    return;
                   }
              }
              connection.query("INSERT INTO `user`( `firstname`, `lastname`, `username`, `password`) VALUES ('"+firstname+"','"+lastname+"','"+username+"','"+hash_password+"')",function(err,rows){
                  connection.release();
                  if(!err) {
                      //res.json(rows);
                       res.json({"success":true,"status" : "User inserted"});
                  }
              });

          });


           

          connection.on('error', function(err) {
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
          });
       });
       return;
    });

    // Check username & password  ( LOGIN )
    app.get('/api/user', function (req, res) {

        // create a user, information comes from AJAX request from Angular
        var objectParam = req.query;

        // sanitize username as email
        var username  = sanitizer.value(objectParam.username, 'email');


        pool.getConnection(function(err,connection){
          if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
          }

          // encrypt password to compare with the saved in DB
          var hash_password = encrypt(objectParam.password);

          connection.query("SELECT * FROM `user`	 WHERE `username`='"+username+"' and `password`='"+hash_password+"' ",function(err,rows){
          connection.release();
              if(!err) {
                  res.json(rows);

              }
          });

          connection.on('error', function(err) {
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
          });
       });

       return;
    });
    // Enable Two-Factor Authentication by adding user to Auth and get ID
    app.get('/api/adduser_authy',function (req, res) {

        // create a user, information comes from AJAX request from Angular
        var objectParam = req.query;
        authy.register_user(objectParam.email, objectParam.phone,objectParam.countrycode,function (err, resquest) {
               //res = {user: {id: 1337}} where 1337 = ID given to use, store this someplace
              console.log(" Authy Response  "+JSON.stringify(resquest));
              // store Authy user id in database

              if( resquest.user )
              updateUserAuthyId(objectParam.email,resquest.user.id)
              res.json(resquest);
        });



    });

    // Two-Factor Authentication verify TOKEN
    app.get('/api/verify_token_authy',function (req, res) {

      var objectParam = req.query;

      authy.verify(objectParam.authy_id, objectParam.token, function (err, resquest) {
         if(err)
         console.log(err);
         console.log(" Verify Authy Response  "+JSON.stringify(resquest)+"  ");
         res.json(resquest);
      });
    });
    // Two-Factor Authentication OneTouch request
    app.get('/api/onetouch_authy',function (req, res) {

      var objectParam = req.query;
       console.log(JSON.stringify(objectParam));
      onetouch.send_approval_request(objectParam.authy_id, {
         message: 'Request to Login to Twilio demo app',
         email: objectParam.email
        }, function(err, authyres){
         if (err && err.success != undefined) {
             authyres = err;
             err = null;
         }
        // cb.call(self, err, authyres);
        var tansID=[];
         tansID[authyres.approval_request.uuid] = {};
         tansID[authyres.approval_request.uuid].email = objectParam.email;
         res.json(authyres.approval_request.uuid);
         console.log( JSON.stringify(authyres) +" authyres ");
     });
    });

    // The webhook that Authy will call on a OneTouch event
    app.post('/authy/callback', bodyParser.json(), function(request, response, next){}, function(request, response){ console.log(" authyCallback ");});




    // delete a user
    app.delete('/api/users/:user_id', function (req, res) {

    });






    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};


/*---------- Database functions -----------*/

// update user by setting the AuthyID
function updateUserAuthyId(username,authyid){

  if(poolconnect)
  poolconnect.getConnection(function(err,connection){
          if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
          }

          console.log(" updateUserAuthyId "+username+"  "+authyid);

          connection.query("UPDATE `user`	SET `authyid`="+authyid+" WHERE `username`='"+username+"'  ",function(err,rows){
          connection.release();
              if(!err) {
              }
          });

          connection.on('error', function(err) {
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
          });
      });
}

// function to send OneTouch request
function sendOneTouch(user,cb){

  onetouch.send_approval_request(user.authyid, {
     message: 'Request to Login to Twilio demo app',
     email: user.email
    }, function(err, authyres){
     if (err && err.success != undefined) {
         authyres = err;
         err = null;
     }
     cb.call(self, err, authyres);
 });
  // callback from OneTouch
  function authyCallback(request, response) {
   console.log(" authyCallback ");
     var authyId = request.body.authy_id;

     // Look for a user with the authy_id supplies

     response.end();
 };

}
