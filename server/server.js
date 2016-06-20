var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat', function(err, db) {
    // connection code goes inside
    if(err) throw err;

	console.log("Server started successfully!");

	client.on('connection', function(socket){

	    socket.on('join', function(data){

	        // program code
        	var user_email = data.user_email,
                user_name = data.user_name,
                photo_option = data.photo_option,
                fpass = data.fpass,
                cpass = data.cpass;

            // check for empty fields
            if (user_email === '' || cpass === '' || fpass === ''){
                socket.emit('alert', 'Whoops, you missed one!');
                return;
            }

            // check for matching passwords
            if (fpass !== cpass) {
                socket.emit('alert', 'Your passwords don\'t match.');
                return;
            }

            // create a database variable
            var users = db.collection('users');

            // create a variable to hold the data object
            users.find().sort({_id: 1}).toArray(function(err, res){
                if(err) throw err;

                // create a flag variable
                var newUser = user_email;

                var doesUserExist = function(newUser, res) {
                    if (res.length) {
                        for(var i = 0; i < res.length; i++){

                            var answer;

                            if(newUser === res[i].user_email){
                                answer = "exists";
                                break;
                            } else {
                                answer = "does not exist";   
                            }
                        }
                        return answer;
                    } else {

                        return answer = "does not exist";

                    }
                };

                var found = doesUserExist(newUser, res);

                if (found !== "exists"){
                    // if not found, push the user into the db
                    users.insert({
                        user_email: user_email,
                        user_name: user_name,
                        photo_option: photo_option,
                        password: cpass
                    }, function() {
                        socket.emit('alert', 'Your account has been created');
                        socket.emit('clear-login');
                        return found;
                    }); 
                } else {
                    socket.emit('alert', 'Username already exists. Please use another one.');   
                }
            });
	    });

	});
});

