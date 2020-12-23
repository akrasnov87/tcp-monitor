/*
datname  | xact_commit |              now              | numbackends 
----------+-------------+-------------------------------+-------------
 postgres |         191 | 2020-12-23 15:37:19.872592+03 |           1
(1 row)
*/
module.exports = function(input) {
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
                datname: data[0].trim(),
                xact_commit: parseInt(data[1].trim()),
                now: data[2],
                numbackends: parseInt(data[2].trim()),
            })
        }
    }

    return interfaces;
}