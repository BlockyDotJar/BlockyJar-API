const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

const { UNPROCESSABLE_ENTITY } = require("../utils/responses");

dotenv.config();

/*
 * General database utility functions
 */

const createDatabaseConnection = (multipleStatements) =>
{
    return mysql.createConnection
    (
        {
            host: process.env.MY_SQL_HOST,
            port: process.env.MY_SQL_PORT,
            user: process.env.MY_SQL_USER,
            password: process.env.MY_SQL_PASSWORD || "",
            database: process.env.MY_SQL_DATABASE,
            multipleStatements: multipleStatements
        }
    );
};

const requestDatabase = (connection, query, values, res) =>
{
    return connection.query(query, values)
        .then(results => ([ results ]))
        .catch(error => {
            const response = UNPROCESSABLE_ENTITY(error);
            return res.status(422).jsonp(response);
        });
};

/*
 * MySQL SELECT queries
 */

async function getLink(res, connection, uuid)
{
    const query = "SELECT * FROM `links` WHERE `uuid` = ?";
    const values = [ uuid ];

    const [ [ results ] ] = await requestDatabase(connection, query, values, res);
    const link = results[0];

    return link;
}

async function getLinkByID(res, connection, id)
{
    const query = "SELECT * FROM `links` WHERE `id` = ?";
    const values = [ id ];

    const [ [ results ] ] = await requestDatabase(connection, query, values, res);
    const link = results[0];

    return link;
}

async function isValidUUID(res, connection, uuid)
{
    const link = await getLink(res, connection, uuid);
    const isValidUUID = link !== undefined;
    return isValidUUID;
}

async function isValidID(res, connection, id)
{
    const link = await getLinkByID(res, connection, id);
    const isValidID = link !== undefined;
    return isValidID;
}

async function getLinkImpressions(res, connection, uuid)
{
    const query = "SELECT * FROM `link-impression-details` WHERE `uuid` = ?";
    const values = [ uuid ];

    const [ [ results ] ] = await requestDatabase(connection, query, values, res);
    const result = results[0];

    return result;
}

async function getLinkDateHistory(res, connection, uuid)
{
    const query = "SELECT * FROM `link-date-history` WHERE `uuid` = ?";
    const values = [ uuid ];

    const [ [ results ] ] = await requestDatabase(connection, query, values, res);
    const result = results[0];

    return result;
}

async function getLinkURLHistory(res, connection, uuid)
{
    const query = "SELECT * FROM `link-url-history` WHERE `uuid` = ?";
    const values = [ uuid ];

    const [ [ results ] ] = await requestDatabase(connection, query, values, res);
    const result = results[0];

    return result;
}

/*
 * MySQL INSERT queries
 */

async function insertLink(res, connection, uuid, id, link, expiresOn, deleteExpiredDetails, details, dateChangeHistory, linkChangeHistory)
{
    const query = `INSERT INTO \`links\`(\`uuid\`, \`id\`, \`link\`, \`expiresOn\`, \`deleteExpiredDetails\`) VALUES(?, ?, ?, ?, ?);
                   INSERT INTO \`link-impression-details\`(\`uuid\`, \`details\`) VALUES(?, ?);
                   INSERT INTO \`link-date-history\`(\`uuid\`, \`history\`) VALUES(?, ?);
                   INSERT INTO \`link-url-history\`(\`uuid\`, \`history\`) VALUES(?, ?)`;

    const values = [ uuid, id, link, String(expiresOn), deleteExpiredDetails,
                     uuid, details,
                     uuid, dateChangeHistory,
                     uuid, linkChangeHistory ];

    await requestDatabase(connection, query, values, res);
}

/*
 * MySQL UPDATE queries
 */

async function updateLink(res, connection, uuid, expiresOn, link, deleteExpiredDetails)
{
    const query = "UPDATE `links` SET `link` = ?, `expiresOn` = ?, `deleteExpiredDetails` = ? WHERE `uuid` = ?";
    const values = [ link, String(expiresOn), deleteExpiredDetails, uuid ];

    await requestDatabase(connection, query, values, res);
}

async function updateLinkURLHistory(res, connection, uuid, details)
{
    const query = "UPDATE `link-url-history` SET `history` = ? WHERE `uuid` = ?";
    const values = [ details, uuid ];

    await requestDatabase(connection, query, values, res);
}

async function updateLinkDateHistory(res, connection, uuid, details)
{
    const query = "UPDATE `link-date-history` SET `history` = ? WHERE `uuid` = ?";
    const values = [ details, uuid ];

    await requestDatabase(connection, query, values, res);
}

/*
 * MySQL DELETE queries
 */

async function deleteLink(res, connection, uuid)
{
    const query = "DELETE FROM `links` WHERE `uuid` = ?";
    const values = [ uuid ];

    await requestDatabase(connection, query, values, res);
}

async function deleteLinkDetails(res, connection, uuid)
{
    const query = `DELETE FROM \`link-impression-details\` WHERE \`uuid\` = ?;
                   DELETE FROM \`link-date-history\` WHERE \`uuid\` = ?;
                   DELETE FROM \`link-url-history\` WHERE \`uuid\` = ?`;

    const values = [ uuid, uuid, uuid ];

    await requestDatabase(connection, query, values, res);
}

/*
 * Export modules
 */

module.exports =
{
    createDatabaseConnection: createDatabaseConnection,
    requestDatabase: requestDatabase,
    getLink: getLink,
    getLinkByID: getLinkByID,
    isValidUUID:  isValidUUID,
    isValidID: isValidID,
    getLinkImpressions: getLinkImpressions,
    getLinkDateHistory: getLinkDateHistory,
    getLinkURLHistory: getLinkURLHistory,
    insertLink: insertLink,
    updateLink: updateLink,
    updateLinkURLHistory: updateLinkURLHistory,
    updateLinkDateHistory: updateLinkDateHistory,
    deleteLink: deleteLink,
    deleteLinkDetails: deleteLinkDetails
};