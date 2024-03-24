const mysql = require("mysql2/promise");
require("dotenv").config();

/*
 * General database utility functions
 */

const createDatabaseConnection = () => {
    return mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        port: process.env.MY_SQL_PORT,
        user: process.env.MY_SQL_USER,
        password: process.env.MY_SQL_PASSWORD,
        database: process.env.MY_SQL_DATABASE
    });
}

const requestDatabase = (connection, query, values, res) => {
    return connection.query(query, values)
        .then(results => ([ results ]))
        .catch(err => {
            const errorMessage = err.message;

            res.status(502).jsonp({
                "status": 502,
                "message": errorMessage
            });
        });
}

/*
 * Response related database utility functions
 */

async function getAllAdmins(res, connection) {
    const query = "SELECT * FROM `admins`";
    const values = [];

    const [results] = await requestDatabase(connection, query, values, res);
    const rows = results[0];

    return rows;
}

async function isAdmin(res, connection, userID) {
    const rows = await getAllAdmins(res, connection);
    const isAdmin = rows.some(row => row.userID === userID);

    return isAdmin;
}

async function getAllOwners(res, connection) {
    const query = "SELECT * FROM `admins` WHERE `isOwner` = ?";
    const values = [true];

    const [results] = await requestDatabase(connection, query, values, res);
    const rows = results[0];

    return rows;
}

async function isOwner(res, connection, userID) {
    const rows = await getAllOwners(res, connection);
    const isOwner = rows.some(row => row.userID === userID);

    return isOwner;
}

/*
 * Export modules
 */

module.exports = {
    createDatabaseConnection: createDatabaseConnection,
    requestDatabase: requestDatabase,
    getAllAdmins: getAllAdmins,
    isAdmin: isAdmin,
    getAllOwners: getAllOwners,
    isOwner: isOwner
}