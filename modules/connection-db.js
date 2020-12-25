/**
 * @file modules/connection-db.js
 * @project big_brother
 * @author Александр
 */

/**
 * объект для работы с БД postgresql
 */
var pg = require('pg');

/**
 * объект для работы с БД
 */
var config = null;

/**
 * функция для инициализации подключения. Возвращается конфигурация для подключения
 * @unittest
 * ('host:192.168.17.43;port:5432;user:test;password:test0;database:test').database == 'test'
 * @param {string} connectionString строка подключения
 * @returns {any}
 * @example
 * var params = init('host:192.168.17.43;port:5432;user:test;password:test0;database:test');
 * console.log(params.host);
 * console.log(params.user);
 * console.log(params.port);
 * console.log(params.password);
 * console.log(params.database);
 */
exports.init = function (connectionString) {
    var data = connectionString.split(';');
    var params = {};
    for (var i in data) {
        var item = data[i];
        params[item.split(':')[0]] = item.split(':')[1];
    }
    config = params;
    return params;
}

/**
 * выполнение запроса
 * @param {string} query запрос
 * @param {any[]} params параметры 
 * @example
 * query(select * from users where id = $1, [1])
 */
exports.query = function (query, params, callback) {
    var client = new pg.Client({
        host: config.host,
        user: config.user,
        port: config.port,
        password: config.password,
        database: config.database
    })
    client.connect();
    var dt = Date.now();
    client.query(query, params, (err, res) => {
        client.end();
        callback(err, res, Date.now() - dt, {
            query: query,
            params: params,
            response: res
        });
    });
}

/**
 * добавление строки
 * @param {string} schema схема
 * @param {string} tableName имя таблицы
 * @param {any} values параметры запроса
 * @returns {string}
 */
exports.insert = function(schema, tableName, values) {
    var query = 'INSERT INTO ' + schema + '.' + tableName + '(';
    for (var i in values) {
        query += '"' + i + '", ';
    }

    query = query.substr(0, query.length - 2) + ') VALUES (';
    var idx = 1;
    for (var i in values) {
        query += '$' + idx + ', ';
        idx++;
    }
    query = query.substr(0, query.length - 2) + ');';

    return query;
}

/**
 * Добавление множества записей
 * @param {string} schema схема
 * @param {string} tableName имя таблицы
 * @param {string} values значение одной записи
 * @param {string} count количество записей
 */
exports.insertMany = function(schema, tableName, values, count) {
    var query = 'INSERT INTO ' + schema + '.' + tableName + '(';
    for (var i in values) {
        query += i + ', ';
    }

    query = query.substr(0, query.length - 2) + ') VALUES ';
    var values_str = '(';
    var idx = 1;
    for (var i in values) {
        values_str += '$' + idx + ', ';
        idx++;
    }
    values_str = values_str.substr(0, values_str.length - 2) + ')';
    query += values_str;

    if (count > 1) {
        for (var j = 1; j < count; j++) {
            values_str = '(';
            for (var i in values) {
                values_str += '$' + idx + ', ';
                idx++;
            }
            values_str = values_str.substr(0, values_str.length - 2) + ')';
            query += ',' + values_str;
        }
    }
    query += ';';
    return query;
}