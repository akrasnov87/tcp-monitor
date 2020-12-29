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
  * eth0  /  daily
  * 
  *          day         rx      |     tx      |    total    |   avg. rate
  *      ------------------------+-------------+-------------+---------------
  *      25.12.2020   213,37 MiB |    1,29 GiB |    1,49 GiB |  148,63 kbit/s
  *      26.12.2020   776,38 MiB |    5,64 GiB |    6,40 GiB |  636,15 kbit/s
  *      27.12.2020   668,37 MiB |  353,88 MiB |    1,00 GiB |   99,25 kbit/s
  *      28.12.2020   881,67 MiB |   14,69 GiB |   15,55 GiB |    1,55 Mbit/s
  *      29.12.2020   318,97 MiB |    2,14 GiB |    2,45 GiB |  572,75 kbit/s
  *      ------------------------+-------------+-------------+---------------
  *      estimated       748 MiB |    5,03 GiB |    5,76 GiB |
  * 
  * -----------------------
  * {
  *     rx: string, // входящий трафик
  *     tx: string // исходящий трафик
  * } 
  */
module.exports = function(input, remoteAddress) {
    var data = input.split('\n');
    var lines = [];
    for(var i in data) {
        data[i] && lines.push(data[i]);
    }
    var line = lines[lines.length - 3];
    var rows = line.replace(/\|/gm, '').split(' ');
    lines = [];
    for(var i in rows) {
        rows[i] && lines.push(rows[i]);
    }

    return [{ 
        c_name: lines[0], 
        n_sent: parseFloat(lines[3].replace(',', '.')), 
        n_received: parseFloat(lines[1].replace(',', '.')), 
        c_ip: remoteAddress, 
        c_sent_name: lines[4], 
        c_received_name: lines[2],
        n_rate: parseFloat(lines[7].replace(',', '.')),
        c_rate_name: lines[8]
    }];
}