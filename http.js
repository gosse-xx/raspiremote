/*
 *                      _                          _
 *                     (_)                        | |
 *  _ __ __ _ ___ _ __  _ _ __ ___ _ __ ___   ___ | |_ ___
 * | '__/ _` / __| '_ \| | '__/ _ \ '_ ` _ \ / _ \| __/ _ \
 * | | | (_| \__ \ |_) | | | |  __/ | | | | | (_) | ||  __/
 * |_|  \__,_|___/ .__/|_|_|  \___|_| |_| |_|\___/ \__\___|
 *               | |
 *               |_|
 *
 * 
 */
// node http libs
var http = require("http");
// node filesystem libs
var fs = require("fs");
// to server up different paths
var path = require("path");

var auth = require("http-auth");
// default no log
var logging = false;

/* This function checks to see if logging is enabled
 * and if it is, logs the message to the console.
 */ 
 function logger(data) {
 	if (logging == true ) {
 		console.log("http.js: " + data)
 	}
 }

/* This function allows raspiremote.js to set enable or 
 * disable logging. 
 */
 function setLogging(value) {
 	if (value == true ) {
 		logging = true;
 	}
 }

 function start() {
 	var basic = auth({
 		authRealm : "Please enter username and password.",
    // username is pi, password is raspiremote
    authList : ['pi:{SHA}2LenIKeYLH6Xu2Y0aJsYq87zDgI=']
});

 	http.createServer(function (request, response) {
			/* Log to the console when a new request comes in.
			 * Note that often it shows multiple requests when requesting 
			 * the index page - the browser requests the page,
			 * the css files, and favicon.ico as well. 
			 */
			 basic.apply(request, response, function(username) {
			 	logger('request starting...');

			// This deals with file paths, making available in ways for node to understand them
			var filePath = '.' + request.url;
			if (filePath == './')
				filePath = './index.html';
			
			/* This part looks at the extension of the file name
			 * that way, our http server can write the correct
			 * filetype in its header. Default is text/html. 
			 */
			 var extname = path.extname(filePath);
			 var contentType = 'text/html';
			 switch (extname) {
			 	case '.js':
			 	contentType = 'text/javascript'; 
			 	break;
			 	case '.css':
			 	contentType = 'text/css';
			 	break;
			 	// The content-type application/force-download is a dirty way of forcing the browser to download the file.
			 	case '.avi':
			 	contentType = 'application/force-download';
			 	logger(contentType);
			 	break;
			 	case '.mp4':
			 	contentType = 'application/force-download';
			 	logger(contentType);
			 	break;
			 	case '.mp3':
			 	contentType = 'application/force-download';
			 	logger(contentType);
			 	break;
			 	case '.m4a':
			 	contentType = 'application/force-download';
			 	logger(contentType);
			 	break;
			 }
			// Checks to see if the path exists.
			path.exists(filePath, function(exists) {
				// If exist, send the file! 
				if (exists) {
					fs.readFile(filePath, function(error, content) {
						// If there's an error, send http 500 to the client. 
						if (error) {
							response.writeHead(500);
							var message = '500 error ' + filePath;
							logger(message);
							response.end();
						}
						// If there is a file, serve it up with an http 200: OK. 
						else {
							response.writeHead(200, { 'Content-Type': contentType });
							var message = "200 OK: " + filePath;
							logger(message);
							response.end(content, 'utf-8');
						}
					});
				}
				// Else, the file doesn't exist, therefore, http 404: file not found. 
				else {
					response.writeHead(404);
					var message = "404 file not found: " + filePath;
					logger(message);
					response.end();
				}
			});

		});
	// Listen on port 8080
}).listen(8080);

}

// Export the function so raspiremote.js can call it.
exports.start = start;
exports.setLogging = setLogging;
