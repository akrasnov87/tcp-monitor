/**
 * @file modules/vnstat.js
 * @project big_brother
 * @author Aleksandr Krasnov
 */

 /**
  * Парсинг vnstat - результата
  * @param {string} input входная строка
  * @returns {any}
  * @example
  * var vnstat = require('./modules/vnstat')(input);
  * 
  * rx:       60 kbit/s    59 p/s          tx:       39 kbit/s    38 p/s
  * -----------------------
  * {
  *     rx: string, // входящий трафик
  *     tx: string // исходящий трафик
  * } 
  */
module.exports = function(input, remoteAddress) {
    var matchs = /rx:\s+\d+\s+[\w\/]+\s+\d+\s+[\w\/]+\s+tx:\s+\d+\s+[\w\/]+\s+\d+\s+[\w\/]+/gm.exec(input);
    var lines = [];
    if(matchs.length > 0) {
        var input = matchs[0];
        var data = input.split(' ');
        for(var i in data) {
            data[i] && lines.push(data[i]);
        }
    }

    return [{n_sent: parseFloat(lines[6].replace(',', '.')), n_received: parseFloat(lines[1].replace(',', '.')), c_ip: remoteAddress, c_sent_name: lines[7], c_received_name: lines[2]}];
}