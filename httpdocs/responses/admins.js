const mysql = require("../utils/mysql");
const { getUsers } = require("../utils/twitch");

/*
 * GET /v1/apujar/admins/:admin_id
 */

async function getAdmin(res, api, adminID)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    getAdminResponse(res, connection, userID, adminID);
}

async function getAdminResponse(res, connection, userID, adminID)
{
    const hasAdminPerms = await mysql.isAdmin(res, connection, userID);

    if (!hasAdminPerms)
    {
        return res.status(403).jsonp
        (
            {
                "status": 403,
                "message": "You are not an admin of ApuJar."
            }
        );
    }

    const admins = await mysql.getAllAdmins(res, connection);

    const admin = admins.find(row =>
    {
        const id = row.userID;
        return id === adminID;
    });

    if (admin === undefined)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No admin with id '${adminID}' found.`
            }
        );
    }

    const id = admin.userID;
    const login = admin.userLogin;

    return res.jsonp
    (
        {
            "status": 200,
            "user": {
                "id": id,
                "login": login
            }
        }
    );
}

/*
 * GET /v1/apujar/admins
 */

async function getAdmins(res, api)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    getAdminsResponse(res, connection, userID);
}

async function getAdminsResponse(res, connection, userID)
{
    const hasAdminPerms = await mysql.isAdmin(res, connection, userID);

    if (!hasAdminPerms)
    {
        return res.status(403).jsonp
        (
            {
                "status": 403,
                "message": "You are not an admin of ApuJar."
            }
        );
    }

    const admins = await mysql.getAllAdmins(res, connection, true);

    const users = admins.map(admin =>
    {
        const id = admin.userID;
        const login = admin.userLogin;

        return {
                    "id": id,
                    "login": login
               };
    });

    return res.jsonp
    (
        {
            "status": 200,
            "users": users
        }
    );
}

/*
 * POST /v1/apujar/admins
 */

async function postAdmin(res, api, id, login)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    postAdminResponse(res, connection, userID, id, login);
}

async function postAdminResponse(res, connection, userID, id, login)
{
    let hasOwnerPerms = await mysql.isOwner(res, connection, userID);

    if (!hasOwnerPerms)
    {
        return res.status(403).jsonp
        (
            {
                "status": 403,
                "message": "You are not an owner of ApuJar."
            }
        );
    }

    const hasAdminPerms = await mysql.isAdmin(res, connection, id);

    if (hasAdminPerms)
    {
        return res.status(409).jsonp
        (
            {
                "status": 409,
                "message": `Admin with id '${id}' already exists.`
            }
        );
    }

    hasOwnerPerms = await mysql.isOwner(res, connection, id);

    if (hasOwnerPerms)
    {
        return res.status(409).jsonp
        (
            {
                "status": 409,
                "message": `Owner with id '${id}' already exists.`
            }
        );
    }

    const query = "INSERT INTO `admins`(`userID`, `userLogin`, `isOwner`) VALUES(?, ?, ?)";
    const values = [ id, login, false ];

    await mysql.requestDatabase(connection, query, values, res);

    getAdminsResponse(res, connection, userID);
}

/*
 * DELETE /v1/apujar/admins/:admin_id
 */

async function deleteAdmin(res, api, adminID)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    deleteAdminResponse(res, connection, userID, adminID);
}

async function deleteAdminResponse(res, connection, userID, adminID)
{
    const hasOwnerPerms = await mysql.isOwner(res, connection, userID);

    if (!hasOwnerPerms)
    {
        return res.status(403).jsonp
        (
            {
                "status": 403,
                "message": "You are not an owner of ApuJar."
            }
        );
    }

    const hasAdminPerms = await mysql.isAdmin(res, connection, adminID);

    if (!hasAdminPerms)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `Admin with id '${adminID}' doesn't exist.`
            }
        );
    }

    const query = "DELETE FROM `admins` WHERE `userID` = ?";
    const values = [ adminID ];

    await mysql.requestDatabase(connection, query, values, res);

    getAdminsResponse(res, connection, userID);
}

/*
 * Export modules
 */

module.exports =
{
    getAdmin: getAdmin,
    getAdmins: getAdmins,
    postAdmin: postAdmin,
    deleteAdmin: deleteAdmin
};