const mysql = require("../utils/mysql");
const { getUsers } = require("../utils/twitch");

/*
 * GET /v1/apujar/owners/:owner_id
 */

async function getOwner(res, api, ownerID)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    getOwnerResponse(res, connection, userID, ownerID);
}

async function getOwnerResponse(res, connection, userID, ownerID)
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

    const owners = await mysql.getAllOwners(res, connection);

    const owner = owners.find(row => 
    {
        const id = row.userID;
        return id === ownerID;
    });

    if (owner === undefined)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No owner with id '${ownerID}' found.`
            }
        );
    }

    const id = owner.userID;
    const login = owner.userLogin;

    return res.status(200).jsonp
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
 * GET /v1/apujar/owners
 */

async function getOwners(res, api)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    getOwnersResponse(res, connection, userID);
}

async function getOwnersResponse(res, connection, userID)
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

    const owners = await mysql.getAllOwners(res, connection);

    const users = owners.map(owner =>
    {
        const id = owner.userID;
        const login = owner.userLogin;

        return {
                    "id": id,
                    "login": login
               };
    });

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "users": users
        }
    );
}

/*
 * POST /v1/apujar/owners
 */

async function postOwner(res, api, id, login)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    postOwnerResponse(res, connection, userID, id, login);
}

async function postOwnerResponse(res, connection, userID, id, login)
{
    if (userID !== 755628467 && userID !== 896181679)
    {
        return res.status(403).jsonp
        (
            {
                "status": 403,
                "message": "You are not a founder of ApuJar."
            }
        );
    }

    const hasOwnerPerms = await mysql.isOwner(res, connection, id);

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

    const hasAdminPerms = await mysql.isAdmin(res, connection, id);

    let query = "INSERT INTO `admins`(`userID`, `userLogin`, `isOwner`) VALUES(?, ?, ?)";
    let values = [ id, login, true ];

    if (hasAdminPerms)
    {
        query = "UPDATE `admins` SET `isOwner` = ? WHERE `userID` = ?";
        values = [ true, id ];
    }

    await mysql.requestDatabase(connection, query, values, res);
    
    getOwnersResponse(res, connection, userID);
}

/*
 * DELETE /v1/apujar/owners/:owner_id
 */

async function deleteOwner(res, api, ownerID)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    deleteOwnerResponse(res, connection, userID, ownerID);
}

async function deleteOwnerResponse(res, connection, userID, ownerID)
{
    if (userID !== 755628467 && userID !== 896181679)
    {
        return res.status(403).jsonp
        (
            {
                "status": 403,
                "message": "You are not a founder of ApuJar."
            }
        );
    }

    const hasOwnerPerms = await mysql.isOwner(res, connection, ownerID);

    if (!hasOwnerPerms)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `Owner with id '${ownerID}' doesn't exist.`
            }
        );
    }

    const query = "DELETE FROM `admins` WHERE `userID` = ?";
    const values = [ ownerID ];

    await mysql.requestDatabase(connection, query, values, res);

    getOwnersResponse(res, connection, userID);
}

/*
 * Export modules
 */

module.exports =
{
    getOwner: getOwner,
    getOwners: getOwners,
    postOwner: postOwner,
    deleteOwner: deleteOwner
};