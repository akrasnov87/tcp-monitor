/**
 * @file modules/iotop.js
 * @project big_brother
 * @author Aleksandr Krasnov
 */

/**
 * Парсинг iotop - результата
 * @param {string} input входная строка
 * @returns {any}
 * @example
 * var iotop = require('./modules/iotop')(input);
 * 
 * Linux 4.15.0-128-generic (dev-db-v-09)  25.12.2020      _x86_64_        (8 CPU)
 * 
 * Device             tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
 * loop0             0,15         0,16         0,00      11597          0
 * loop1             0,00         0,02         0,00       1134          0
 * loop2             0,00         0,00         0,00          5          0
 * sda               5,77        66,23        99,29    4722003    7078620
 * 
 * ----------------------------------------------------------------------
 * 
 * {
 *      c_device: string,
 *      n_tps: float, //  означает количество запросов на чтение или запись к устройству в секунду;
 *      n_kb_read_s: float, // количество килобайт или мегабайт, прочитанных с устройства за секунду;
 *      n_kb_wrtn_s: float, // количество килобайт или мегабайт записанных на устройство в секунду;
 *      n_kb_read: float, // общее количество прочитанных данных с диска с момента загрузки системы;
 *      n_kb_wrtn: float // количество записанных данных с момента загрузки системы;
 * }
 */
module.exports = function(input, remoteAddress) {
    var interfaces = [];

    var lines = input.split('\n');
    var isDevice = false;
    for(var i in lines) {
        var line = lines[i];
        if(line && line.indexOf('Device') >= 0) {
            isDevice = true;
            continue;
        }

        if(line && isDevice) {
            var data = line.replace(/\s+/gi, ' ').split(' ');
            interfaces.push({
                c_device: data[0].trim(),
                n_tps: parseFloat(data[1].replace(',', '.').trim()),
                n_kb_read_s: parseFloat(data[2].replace(',', '.').trim()),
                n_kb_wrtn_s: parseFloat(data[3].replace(',', '.').trim()),
                n_kb_read: parseInt(data[4].trim()),
                n_kb_wrtn: parseInt(data[5].trim()),
                c_ip: remoteAddress
            })
        }
    }

    return interfaces;
}