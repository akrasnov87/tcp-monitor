var net = require('net');

var HOST = '0.0.0.0';
var PORT = 3000;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        try {
            var input = data.toString();
            if(input.indexOf('top - ') >= 0) {
                var top = require('./modules/top-parser')(input, {}, error=>{ });
            } else if(input.indexOf('Refreshing:') >= 0) {
                var nethogs = require('./modules/nethogs')(input);
            } else if(input.indexOf('xact_commit' >= 0)) {
                var postgres = require('./modules/postgres')(input);
            }
            console.log('DATA ' + sock.remoteAddress + ': ' + input);
        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data.toString() + '"');
        } catch(e) {
            
        }
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);