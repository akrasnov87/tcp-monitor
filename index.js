/**
 * @file /index.js
 * @project big_brother
 * @author Aleksandr Krasnov
 */

var args = require("args-parser")(process.argv);
var net = require('net');
var packager = require('mobnius-packager/index-v2');
var pgConn = require('./modules/connection-db');
var layout_result = require('mobnius-pg-dbcontext/modules/result-layout');

var HOST = args.host || '0.0.0.0';
var PORT = args.port || "3981";
var sockets = [];

pgConn.init(args.connection_string);

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    sockets.push(sock);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        var buffer = null;
        try {
            var input = data.toString();
            if(input == 'Hello, World!!!') {
                buffer = createPkg('args', [args], sock.remoteAddress);
                sock.write(buffer);
                sock.write('\n');
                sock.isFriend = true;
                return;
            }

            var sending = false;
            for(var s in sockets) {
                var socket = sockets[s];
                if(socket.isFriend) {
                    sending = true;
                }
            }

            if(input.indexOf('[sql ') == 0) {
                !args.debug || console.log('SQL QUERY: ' + input);
                var items = input.split('\n');
                for(var i in items) {
                    input = items[i];
                    if(input.trim()) {
                        var idx = input.indexOf(']');
                        var params = input.substr(0, idx).split(' ');
                        var sql = pgConn.query(input.substr(idx + 1, input.length - (idx + 1)), null, function(err, res) {
                            if(err) {
                                !args.debug || console.log('ERR SQL: ' + err.toString());
                            } else {
                                sock.write(createPkg(params[1], res.rows, params[2]));
                                sock.write('\n');
                            }
                        });
                    }
                }
                return;
            }

            if(!sending) {
                sockets.forEach(function(otherSocket) {
                    if (otherSocket !== sock) {
                        if(!otherSocket.isFriend && !otherSocket.destroyed) {
                            otherSocket.write("No friend");
                            otherSocket.write('\n');
                        }
                    }
                });
            }

            if(input.indexOf('top - ') >= 0) {
                var item = require('./modules/top-parser')(input, {}, error=>{ });
                buffer = createPkg('top', [item], sock.remoteAddress);
                var items = [{
                    n_la1: parseFloat(item.top.load_average[0].replace(',', '.')),
                    n_la2: parseFloat(item.top.load_average[1].replace(',', '.')),
                    n_la3: parseFloat(item.top.load_average[2].replace(',', '.')),
                    n_users: parseInt(item.top.user),
                    n_task_total: parseInt(item.tasks.total),
                    n_task_running: parseInt(item.tasks.running),
                    n_mem_total: parseInt(item.mem.total),
                    n_mem_used: parseInt(item.mem.used),
                    jb_processes: JSON.stringify(item.processes[0]),
                    c_ip: sock.remoteAddress
                }];

                var sql = pgConn.insertMany('dbo', 'cd_top', items[0], items.length);
                var values = [];
                for(var i in items) {
                    for(var j in items[i]) {
                        values.push(items[i][j]);
                    }
                }
                pgConn.query(sql, values, (err, res, time, opts)=>{
                    if(err) {
                        !args.debug || console.log('ERR TOP: ' + JSON.stringify(opts) + '. ' + err.toString());
                    }
                });
            } else if(input.indexOf('xact_commit') >= 0) {
                var psql = require('./modules/psql')(input, sock.remoteAddress);
                buffer = createPkg('psql', psql, sock.remoteAddress);
                var sql = pgConn.insertMany('dbo', 'cd_psql', psql[0], psql.length);
                var values = [];
                for(var i in psql) {
                    for(var j in psql[i]) {
                        values.push(psql[i][j]);
                    }
                }
                pgConn.query(sql, values, (err, res, time, opts)=>{
                    if(err) {
                        !args.debug || console.log('ERR PSQL: ' + JSON.stringify(opts) + '. ' + err.toString());
                    }
                });
            } else if(input.indexOf('1K-blocks') >= 0) {
                var df = require('./modules/df')(input, sock.remoteAddress);
                buffer = createPkg('df', df, sock.remoteAddress);
                var sql = pgConn.insertMany('dbo', 'cd_df', df[0], df.length);
                var values = [];
                for(var i in df) {
                    for(var j in df[i]) {
                        values.push(df[i][j]);
                    }
                }
                pgConn.query(sql, values, (err, res, time, opts)=>{
                    if(err) {
                        !args.debug || console.log('ERR DF: ' + JSON.stringify(opts) + '. ' + err.toString());
                    }
                });
            } else if(input.indexOf('kB_wrtn/s') >= 0) {
                var iotop = require('./modules/iotop')(input, sock.remoteAddress);
                buffer = createPkg('iotop', iotop, sock.remoteAddress);
                var sql = pgConn.insertMany('dbo', 'cd_iotop', iotop[0], iotop.length);
                var values = [];
                for(var i in iotop) {
                    for(var j in iotop[i]) {
                        values.push(iotop[i][j]);
                    }
                }
                pgConn.query(sql, values, (err, res, time, opts)=>{
                    if(err) {
                        !args.debug || console.log('ERR IOTOP: ' + JSON.stringify(opts) + '. ' + err.toString());
                    }
                });
            } else if(input.indexOf('rx:') >= 0 && input.indexOf('tx:') >= 0) {
                var vnstat = require('./modules/vnstat')(input, sock.remoteAddress);
                buffer = createPkg('net', vnstat, sock.remoteAddress);
                var sql = pgConn.insertMany('dbo', 'cd_net', vnstat[0], vnstat.length);
                var values = [];
                for(var i in vnstat) {
                    for(var j in vnstat[i]) {
                        values.push(vnstat[i][j]);
                    }
                }
                pgConn.query(sql, values, (err, res, time, opts)=>{
                    if(err) {
                        !args.debug || console.log('ERR NET: ' + JSON.stringify(opts) + '. ' + err.toString());
                    }
                });
            } else if(input.indexOf('daily') >= 0 && input.indexOf('estimated') >= 0) {
                var vnstat = require('./modules/vnstat_log')(input, sock.remoteAddress);
                buffer = createPkg('net-log', vnstat, sock.remoteAddress);
                var sql = pgConn.insertMany('dbo', 'cd_net_log', vnstat[0], vnstat.length);
                var values = [];
                for(var i in vnstat) {
                    for(var j in vnstat[i]) {
                        values.push(vnstat[i][j]);
                    }
                }
                pgConn.query(sql, values, (err, res, time, opts)=>{
                    if(err) {
                        !args.debug || console.log('ERR NET_LOG: ' + JSON.stringify(opts) + '. ' + err.toString());
                    }
                });
            }
            !args.debug || console.log('DATA ' + sock.remoteAddress + ': ' + input);
        } catch(e) {
            sock.write(createPkg('error', e, sock.remoteAddress));
            sock.write('\n');
        }

        if(buffer) {
            sockets.forEach(function(otherSocket) {
                if (otherSocket !== sock && otherSocket.isFriend && !otherSocket.destroyed) {
                    otherSocket.write(buffer);
                    otherSocket.write('\n');
                }
            });
        }
    });

    sock.on('error', function(err) {
        removeSock(sockets);

        console.log(err.stack);
        !args.debug || console.log("Caught flash policy server socket error: " + sock.remoteAddress);
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    sock.on('end', function() {
        !args.debug || console.log('Closing connection with the client: ' + sock.remoteAddress);
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        !args.debug || console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);

        removeSock(sockets);
    });
}).listen(parseInt(PORT), HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

/**
 * удаление лишних подключений
 * @param {any[]} sockets - массив
 */
function removeSock(sockets) {
    var temp = [];
    for(var i in sockets) {
        if(!sockets[i].destroyed) {
            temp.push(sockets[i]);
        }
    }

    sockets = temp;
}

function createPkg(type, data, ip) {
    var pkg = packager.write();
    pkg.meta(true, type, '1.0', ip);
    pkg.blockFrom('from0', layout_result.ok(data));
    return pkg.flush(0, 'NML');
}