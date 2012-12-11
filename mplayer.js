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
 * mplayer.js: 
 * Authors: 
 * 		Ashley Bingle, Gary Ossewaarde
 * 		Josh Peters, Kalee Ritsema, and
 * 		Mitch Vanderzee
 * 
 */

// Default mediastore is local directory data. 
var mediastore = "data";
// Default filename is mousetrap.avi 
var filename = "mousetrap.avi";
// Default logging is set to off. 
var logging = false;
// Default volume is 100 
var vol = 100;
/* This is whether the playback is muted or not. This helps the mute function
* know to mute or unmute
*/
var muted = false;


/* This function checks to see if logging is enabled
 * and if it is, logs the message to the console.
 */ 
 function logger(data) {
 	if (logging == true ) {
 		console.log("mplayer.js: " + data)
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
	/* Use child_process to spawn an instance of
	 * mplayer in idle, slave mode. 
	 */
	 var spawn = require('child_process').spawn;
	 var mplayer = spawn('mplayer', ['-idle', '-slave']); 
	 /* This is the status of the playback. It's initially set to 
	  * gibberish since the playback is not technically playing nor stopped.
	  */
	  var status = 'fhqwhgads';
	/* This captures stdout and is for debugging. It captures mplayer's output
	 * to stdout (console) and logs it to node's console output. 
	 */	 
	 mplayer.stdout.on('data', function (data) {
	 	logger('stdout: ' + data); 
	 });
	/* This captures stderr and is for debugging. It captures mplayer's output
	 * to stderr (console) and logs it to node's console output. 
	 */
	 mplayer.stderr.on('data', function (data) {
	 	logger('stderr: ' + data); 
	 });
	/* This captures exit code and is for debugging. It capture's mplayer exit code
	 * so we know if it exits normally or not. 
	 */
	 mplayer.on('exit', function (code) {
	 	logger('exited with code: ' + code); 
	 });

	/* Websockets! 
	 * This is how the browser will communicate to 
	 * mplayer. It receives a function from the browser
	 * and passes along the appropriate command and 
	 * accompanying information to mplayer.
	 */
	 var io = require('socket.io').listen(8001);
	 if (logging == true ) {
	 	io.set('log level', 2); 
	 } else { 
	 	io.set('log level', 0);
	 }
	 io.sockets.on('connection', function (socket) {	
			/* Play/pause button.
			 * When the socket receives play, play the file!
			 */
			 socket.on('playpause', function() {
			 	if (status == 'playing' ) {
			 		logger('pause');
			 		mplayer.stdin.write('pause\n');
			 		status = 'paused';
			 	} else if (status == 'paused') {
			 		logger('unpause');
			 		mplayer.stdin.write('pause\n');
			 		status = 'playing';
			 	} 
			 	else {
			 		logger('play');
			 		logger('loadfile ' + mediastore + '/' + filename + '\n');
			 		mplayer.stdin.write("loadfile " + mediastore + '/' + filename + "\n");
			 		status = 'playing';
			 	}

			 });
			/* Stop button.
			 * When the socket receives stop, stop the playback!
			 */			
			 socket.on('stop', function () {
			 	logger('stop');
			 	mplayer.stdin.write("stop\n");
			 	status = 'stopped';
			 });
			/* Rewind button.
			 * When the socket receives rewind, rewind the file!
			 */			
			 socket.on('rwd', function () {
			 	logger('rwd');
			 	// mplayer.stdin.write("speed_incr -.1\n");
			 	// status = 'rewinding';
			 	mplayer.stdin.write("seek -6\n");
			 });
			/* Fast forward button.
			 * When the socket receives fast forward, fast forward the file!
			 */			
			 socket.on('ff', function () {
			 	logger('ff');
			 	// mplayer.stdin.write("speed_incr .1\n");
			 	// status = 'fast forwading';
			 	mplayer.stdin.write("seek +5\n");
			 });
			 /* Volume up button. 
			  * When the socket receives volup, turn up the volume! 
			  */
			  socket.on('volup', function () {
			  	logger('volup');
			  	logger("volume " + "+1\n");
			  	vol = vol + 1;
			  	mplayer.stdin.write("volume " + "+1\n");
			  });
			 /* Volume down button. 
			  * When the socket receives voldown, turn down the volume! 
			  */
			  socket.on('voldown', function () {
			  	logger('voldown');
			  	logger("volume " + "-1\n");
			  	vol = vol - 1;
			  	mplayer.stdin.write("volume " + "-1\n");
			  });
			 /* Mute button. 
			  * When the socket receives mute, mute! 
			  */
			  socket.on('mute', function () {
			  	if (muted == false) {
			  		logger("mute!!!");
			  		logger("volume 0 1\n");
			  		mplayer.stdin.write("volume 0 1\n");
			  		muted = true;
			  	}
			  	else if (muted == true)  {
			  		logger("unmute!!");
			  		logger("volume 100 1\n");
			  		logger("vol is " + vol);
			  		for (var i=0;i<vol;i++) {
			  			logger(i);
			  			mplayer.stdin.write("volume +1\n") 
			  		}
			  		muted = false;
			  	}

			  });
			/* Load a new filename - this is called
			 * when a new file is selected via
			 * the client. 
			 */
			 socket.on('loadfile', function(newFilename) {
			 	logger('loadfile: ' + newFilename);
			 	filename = newFilename; 
			 	status = "stopped";
			 });
			 /* This changes the level of 
			  * logging. This can be called by the browser
			  * if desired. 
			  */
			  socket.on('changeLogging', function(newLogging) {
			  	logger('changeLogging: ' + newLogging);
			  	logging = newLogging;

			  });

			/* Sets data dir - called by settings page on the 
			 * client.
			 */
			 socket.on('setDataDir', function (newDataDir) {
			 	if (newDataDir == '' ) {
			 		logger("setDataDir: received null. Doing nothing.")
			 	} else {
			 		logger('setDataDir: ' + newDataDir );
			 		mediastore = newDataDir;
			 	}
			 });

			 /* Sets the volume - controller via volume slider
			  * on the client. 
			  * DEPRECATED - use volup, voldown, mute instead. 
			  */
			  socket.on('volume', function (newVolume) {
			  	
			  	logger('setVolume: ' + newVolume );
			  	logger("volume " + newVolume + " 1\n");
			  	var message = "volume " + newVolume + " 1\n";
			  	mplayer.stdin.write(message);
			  });

			/* This is how the browser asks for 
			 * a list of filse in the mediastore directory. It
			 * returns a list of files formatted in an unordered
			 * list (<ul>) with each each a list item (<li>) 
			 */
			 socket.on('filesplease', function() {
			 	logger('May I have some files please?');
			 	var fs = require("fs");
			 	fs.readdir(mediastore, function (err, files) {
			 		if (err) {
			 			logger(err);
			 			return;
			 		}

                        /* This generates and returns an HTML-formatted list
						 * desired output is: 
						 * <ul class="playlist">
						 * <li><a href="#"><i class="icon-download-alt"></li></a>
						 * <a id="element" onclick=sendFilename(this.id)"</a></li>
						 * </ul> 
						 */ 
						 var list = "<ul class=\"playlist\">\n";
						 files.forEach(listFiles);
						 function listFiles(element) {
						 	list += "<li><a href=\""
						 	list += mediastore;
						 	list += "/";
						 	list += element;
						 	list += "\"><i class=\"icon-download-alt\"></i></a>&nbsp;&nbsp;<a id=\"";
						 	list += element;
						 	list += "\" onclick=\"sendFilename(this.id)\">"
						 	list += element;
						 	list += "</a></li>";
						 }
						 list += "</ul>";
						 io.sockets.emit("filelist", list);
						});
			 });
});
}

// Export the function so raspiremote.js can call it.
exports.start = start;
exports.setLogging = setLogging;
