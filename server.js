// set up ======================================================================
var express = require('express');
var app = express(); 						// create our app w/ express
//var mongoose = require('mongoose'); 				// mongoose for mongodb
var port = process.env.PORT || 8080; 				// set the port
//var database = require('./config/database'); 			// load the database config
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var config = require('./config');
var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : config.host,
  user     : config.user,
  password : config.password,
  port     : config.port,
  database : config.database
});
/*
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

connection.query('SELECT * from user', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
});

connection.end();*/

// configuration ===============================================================
//mongoose.connect(database.localUrl); 	// Connect to local MongoDB instance. A remoteUrl is also available (modulus.io)

app.use(express.static('./public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

var server = require('http').Server(app);
// routes ======================================================================
require('./server/routes.js')(app,pool,server);



// listen (start app with node server.js) ======================================

server.listen(port);
//app.listen(port);
console.log("App listening on port " + port);
