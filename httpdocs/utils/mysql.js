const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

/*
 * General database utility functions
 */

const createDatabaseConnection = () =>
{
    return mysql.createConnection
    (
        {
            host: process.env.MY_SQL_HOST,
            port: process.env.MY_SQL_PORT,
            user: process.env.MY_SQL_USER,
            password: process.env.MY_SQL_PASSWORD,
            database: process.env.MY_SQL_DATABASE
        }
    );
};

const requestDatabase = (connection, query, values, res) =>
{
    return connection.query(query, values)
        .then(results => ([ results ]))
        .catch(err =>
            {
                const errorMessage = err.message;

                return res.status(422).jsonp
                (
                    {
                        "status": 422,
                        "message": errorMessage
                    }
                );
            }
        );
};

/*
 * Response related database utility functions
 */

async function getAllAdmins(res, connection, excludeOwner)
{
    let query = "SELECT * FROM `admins`";
    let values = [];

    if (excludeOwner)
    {
        query += " WHERE `isOwner` = ?"
        values = [ false ];
    }

    const [ results ] = await requestDatabase(connection, query, values, res);
    const admins = results[0];

    return admins;
}

async function isAdmin(res, connection, userID)
{
    const admins = await getAllAdmins(res, connection);

    const isAdmin = admins.some(admin =>
    {
        const adminID = admin.userID;
        return adminID === userID;
    });

    return isAdmin;
}

async function getAllOwners(res, connection)
{
    const query = "SELECT * FROM `admins` WHERE `isOwner` = ?";
    const values = [ true ];

    const [ results ] = await requestDatabase(connection, query, values, res);
    const owners = results[0];

    return owners;
}

async function isOwner(res, connection, userID)
{
    const owners = await getAllOwners(res, connection);

    const isOwner = owners.some(owner =>
    {
        const ownerID = owner.userID;
        return ownerID === userID;
    });

    return isOwner;
}

async function getAllBibleEntries(res, connection)
{
    const query = "SELECT * FROM `bible`";
    const values = [];

    const [ results ] = await requestDatabase(connection, query, values, res);
    const bibleEntries = results[0];

    return bibleEntries;
}

async function getAllLinks(res, connection)
{
    const query = "SELECT * FROM `links`";
    const values = [];

    const [ results ] = await requestDatabase(connection, query, values, res);
    const links = results[0];

    return links;
}

async function isValidUUID(res, connection, uuid)
{
    const links = await getAllLinks(res, connection);

    const isValidUUID = links.some(link =>
    {
        const linkUUID = link.uuid;
        return linkUUID === uuid;
    });

    return isValidUUID;
}

/*
 * Export modules
 */

module.exports =
{
    createDatabaseConnection: createDatabaseConnection,
    requestDatabase: requestDatabase,
    getAllAdmins: getAllAdmins,
    isAdmin: isAdmin,
    getAllOwners: getAllOwners,
    isOwner: isOwner,
    getAllBibleEntries: getAllBibleEntries,
    getAllLinks: getAllLinks,
    isValidUUID:  isValidUUID
};