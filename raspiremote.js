/* Raspberry Pi Remote! 
 *                      _                          _       
 *                     (_)                        | |      
 *  _ __ __ _ ___ _ __  _ _ __ ___ _ __ ___   ___ | |_ ___ 
 * | '__/ _` / __| '_ \| | '__/ _ \ '_ ` _ \ / _ \| __/ _ \
 * | | | (_| \__ \ |_) | | | |  __/ | | | | | (_) | ||  __/
 * |_|  \__,_|___/ .__/|_|_|  \___|_| |_| |_|\___/ \__\___|
 *               | |                                       
 *               |_|                                       
 * This is the main file. To run the application, 
 * simply type 'node raspiremote.js' at the command
 * line. 
 * Requirements: 
 * 		node.js, socket.io, and mplayer
 */ 

/* Includes: these include our other files in our project, sorted this way
 * for easier usage and maintenability. 
 */
 var httpServer = require("./http.js");
 var mplayer = require("./mplayer.js");

 console.log("Welcome To: ");
 console.log("                      _                          _       ");
 console.log("                     (_)                        | |      ");
 console.log("  _ __ __ _ ___ _ __  _ _ __ ___ _ __ ___   ___ | |_ ___ ");
 console.log(" | '__/ _` / __| '_ \\| | '__/ _ \\ '_ ` _ \\ / _ \\| __/ _ \\");
 console.log(" | | | (_| \\__ \\ |_) | | | |  __/ | | | | | (_) | ||  __/");
 console.log(" |_|  \\__,_|___/ .__/|_|_|  \\___|_| |_| |_|\\___/ \\__\\___|");
 console.log("               | |                                       ");
 console.log("               |_|                                       ");


// Start the http server.
httpServer.start();
// Enable logging for the http server. Set this to false if you wish to disable console output. 
httpServer.setLogging(true);
// Start mplayer.
mplayer.start();
// Enable logging for mplayer. Set this to false if you wish to disable console output. 
mplayer.setLogging(true);
