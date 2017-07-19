var express = require('express');
var app = express();
var url = require('url');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');
require('dotenv').load();

var pg = require("pg"); // This is the postgres database connection module.
const connectionString = process.env.DATABASE_URL;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
	if(request.session.username){
		response.render('pages/practice')
	}
	else{
		response.render('pages/account');	
	}
  
});

app.post('/signup', function(request, response) {
	var username = request.body.username;
	var password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
    var email = request.body.email;
    console.log("Adding person to DB with name: " + username + ", password: " + password + ", and email: " + email);

	if(username && password && email){
		var client = new pg.Client(connectionString);
		console.log(connectionString);
		client.connect(function(err) {
			if (err) {
				console.log("Error connecting to DB: ")
				console.log(err);
  				response.json({success: false, message: 'Error connecting to DB'});
			}
			var sql = "insert into musician (username, password, email) values ($1, $2, $3) returning id;";
			var params = [username, password, email];

			var query = client.query(sql, params, function(err, result) {
			// we are now done getting the data from the DB, disconnect the client
				client.end(function(err) {
					if (err) throw err;
				});

				if (err) {
					console.log("Error in query: ")
					console.log(err);
  					response.json({success:  false, message: 'Error in query'});
				}else{
					console.log("logging in");
  					request.session.username = username;
  					request.session.musician_id = result.rows[0].id;
  					request.session.save(); 
  					console.log(request.session);
  					response.json({success: true, redirect: '/practice.html'})
				}

			});
		});
	} else{
		response.status(500).json({success: false, message: 'You must enter a username, password, and email'});
	}

});

app.post('/login', function(request, response) {
  	var username = request.body.username;
  	var password = request.body.password;
  	console.log("Username: " + username + "\nPassword: " + password);
  	var client = new pg.Client(connectionString);
  	console.log(connectionString);
  	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
  			return response.json({ success: false, message: 'Error connecting to DB'});
		}

		var sql = "SELECT *  FROM musician WHERE username = $1;";
		var params = [username];

		var query = client.query(sql, params, function(err, result) {
		// we are now done getting the data from the DB, disconnect the client
			client.end(function(err) {
				if (err) throw err;
				});

				if (err) {
					console.log("Error in query: ")
					console.log(err);
  					response.json({success:  false, message: 'Error in query'});
				}
				else if (!result.rows[0].username){
					console.log("username not found");
  					response.json({success:  false, message: 'Username not found'});
				}else{
					bcrypt.compare(password, result.rows[0].password, function(err, res) {
    					if(!res){
    						console.log("Incorrect password");
  					 		response.json({success:  false, message: 'Incorrect password'});
    					}
    					else{
    						console.log("logging in");
  							request.session.username = username;
  							request.session.musician_id = result.rows[0].id;
  							request.session.save();			
  							console.log(request.session);
  							response.json({success: true, redirect: '/practice.html'})
    					}
					});	
				}	
		});
				
	});
	
});

app.post('/logout', function(request, response){
  	console.log(request.session);
	if(request.session.username){
		request.session.destroy();
		response.json({success: true, redirect: '/'});
	}
	else
		response.json({success: false});
});

app.post('/idea', function(request, response){
	var name = request.body.name;
	var description = request.body.description;
	var min = request.body.min;
	var max = request.body.max;
	var instrument = request.body.instrument;
	var category = request.body.category;
	var client = new pg.Client(connectionString);
  	console.log(connectionString);
  	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
  			return response.json({ success: false, message: 'Error connecting to DB'});
		}

		var sql = "insert into idea (name, descript, min_time, max_time, instrument, category) values ($1, $2, $3, $4, $5, $6) returning id;";
		var params = [name, description, min, max, instrument, category];

		var query = client.query(sql, params, function(err, result) {

				if (err) {
					console.log("Error in query: ")
					console.log(err);
  					response.json({success:  false, message: 'Error in query'});
				}else{
					sql = "insert into musician_link (musician_id, idea_id) values ($1, $2);";
					params = [request.session.musician_id, result.rows[0].id];
					console.log(params); 
					var query = client.query(sql, params, function(err, result){
						// we are now done getting the data from the DB, disconnect the client
						client.end(function(err) {
							if (err) throw err;
						});
						if (err) {
							console.log("Error in query: ")
							console.log(err);
  							response.json({success:  false, message: 'Error in query'});
						}else{
							response.json({success: true});
						}	
					});	
				}	
		});

				
	});
});

app.post('/practice', function(request, response){
	var client = new pg.Client(connectionString);
  	console.log(connectionString);
  	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
  			return response.json({ success: false, message: 'Error connecting to DB'});
		}

		var sql = "SELECT * FROM idea join musician_link on idea.id = musician_link.idea_id WHERE musician_link.musician_id = $1" ;
		var params = [request.session.musician_id];

		var query = client.query(sql, params, function(err, result) {
			console.log(result.rows)
			// we are now done getting the data from the DB, disconnect the client
			client.end(function(err) {
				if (err) throw err;
			});
			if (err) {
				console.log("Error in query: ")
				console.log(err);
  				response.json({success:  false, message: 'Error in query'});
			}else{
				response.render('pages/db', {results: result.rows});
			}	
		});
	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



