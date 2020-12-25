/**
 * @file modules/df.js
 * @project big_brother
 * @author Aleksandr Krasnov
 */

/**
 * Парсинг df - результата
 * @param {string} input входная строка
 * @returns {any}
 * @example
 * var df = require('./modules/df')(input);
 * 
 * Filesystem     1K-blocks     Used Available Use% Mounted on
 * udev             4029800        0   4029800   0% /dev
 * tmpfs             812300     1096    811204   1% /run
 * /dev/sda2      102629316 90820108   7457196  93% /
 * tmpfs            4061484        8   4061476   1% /dev/shm
 * tmpfs               5120        0      5120   0% /run/lock
 * tmpfs            4061484        0   4061484   0% /sys/fs/cgroup
 * /dev/sda1         523248     6188    517060   2% /boot/efi
 * /dev/loop2        100224   100224         0 100% /snap/core/10444
 * /dev/loop0        100224   100224         0 100% /snap/core/10577
 * tmpfs             812296        0    812296   0% /run/user/1001
 * ----------------------------------------------------------------------
 * 
 * {
 *      name: string,
 *      blocks: int,
 *      used: int,
 *      available: int,
 *      use: string
 * }
 */
module.exports = function(input, remoteAddress) {
    var interfaces = [];

    var lines = input.split('\n');
    lines = lines.slice(1, lines.length);
    for(var i in lines) {
        var line = lines[i];

        if(line) {
            var data = line.replace(/\s+/gi, ' ').split(' ');
            interfaces.push({
                c_name: data[0].trim(),
                n_blocks: parseInt(data[1].trim()),
                n_used: parseInt(data[2].trim()),
                n_available: parseInt(data[3].trim()),
                n_use: parseInt(data[4].trim().replace('%', '')),
                c_ip: remoteAddress
            })
        }
    }

    return interfaces;
}