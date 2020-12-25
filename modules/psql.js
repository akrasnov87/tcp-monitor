/**
 * @file modules/psql.js
 * @project big_brother
 * @author Aleksandr Krasnov
 */

/**
 * Парсинг postgres - результата
 * @param {string} input входная строка
 * @returns {any}
 * @example
 * var postgres = require('./modules/psql')(input);
 * 
 * datname  | xact_commit |              now              | numbackends 
 * ----------+-------------+-------------------------------+-------------
 *  postgres |         191 | 2020-12-23 15:37:19.872592+03 |           1
 * (1 row)
 * ----------------------------------------------------------------------
 * {
 *      datname: string,
 *      xact_commit: int,
 *      now: string,
 *      numbackends: int
 * }
 */
module.exports = function(input, remoteAddress) {
    var interfaces = [];

    var lines = input.split('\n');
    lines = lines.slice(2, lines.length);
    for(var i in lines.slice(2, lines.length)) {
        var line = lines[i];
        if(line.indexOf('(') >=0 )
            break;

        if(line) {
            var data = line.split('|');
            interfaces.push({
                c_datname: data[0].trim(),
                n_xact_commit: parseInt(data[1].trim()),
                n_numbackends: parseInt(data[3].trim()),
                c_ip: remoteAddress
            })
        }
    }

    return interfaces;
}