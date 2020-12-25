/**
 * @file modules/nethogs.js
 * @project big_brother
 * @author Aleksandr Krasnov
 */

 /**
  * Парсинг nethogs - результата
  * @param {string} input входная строка
  * @returns {any}
  * @example
  * var nethogs = require('./modules/nethogs')(input);
  * 
  * Refreshing:
  * unknown TCP/0/0 0       0
  * -----------------------
  * {
  *     name: string, // наименование приложения, службы
  *     sent: float, // отправлено
  *     received: float // получено
  * } 
  */
module.exports = function(input, remoteAddress) {
    var interfaces = [];
    var str = 'Refreshing:';
    var idx = input.indexOf(str);
    if(idx >= 0) {
        var data = input.substr(idx + str.length + 1, input.length - (idx + str.length + 1));
        var lines = data.split('\n');
        for(var i in lines) {
            if(lines[i]) {
                var line = lines[i];
                var name = line.substr(0, line.indexOf('/'));
                var nums = line.split('\t');

                interfaces.push({c_name: name, n_sent:parseFloat(nums[1].replace(',', '.')), n_received: parseFloat(nums[2].replace(',', '.')), c_ip: remoteAddress});
            }
        }
    }
    return interfaces;
}