const { createDatabaseConnection, requestDatabase, getAllAdmins, isAdmin, getAllOwners, isOwner } = require("./mysql");
const { getUsers } = require("./twitch");

/*
 * GET /v1/admins/:admin_id
 */

async function getAdmin(res, api, adminID) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    getAdminResponse(res, connection, userID, adminID);
}

async function getAdminResponse(res, connection, userID, adminID) {
    const hasAdminPerms = isAdmin(res, connection, userID);

    if (!hasAdminPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an admin of ApuJar."
        });
                
        return;
    }

    const query = "SELECT * FROM `admins` WHERE `userID` = ?";
    const values = [adminID];

    const [results] = await requestDatabase(connection, query, values, res);
    const rows = results[0];

    if (rows.length === 0) {
        res.status(404).jsonp({
            "status": 404,
            "message": `No admin with id '${adminID}' found.`
        });
                
        return;
    }

    const row = rows[0];

    res.jsonp({
        "status": 200,
        "user": {
            "id": row.userID,
            "login": row.userLogin
        }
    });
}

/*
 * GET /v1/admins
 */

async function getAdmins(res, api) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    getAdminsResponse(res, connection, userID);
}

async function getAdminsResponse(res, connection, userID) {
    const query = "SELECT * FROM `admins` WHERE `isOwner` = ?";
    const values = [false];

    const [results] = await requestDatabase(connection, query, values, res);
    const rows = results[0];

    if (rows.length === 0) {
        res.status(404).jsonp({
            "status": 404,
            "message": `No admins found.`
        });
                
        return;
    }

    const hasAdminPerms = isAdmin(res, connection, userID);

    if (!hasAdminPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an admin of ApuJar."
        });
                
        return;
    }

    const users = rows.map(row => ({
        "id": row.userID,
        "login": row.userLogin
    }));

    res.jsonp({
        "status": 200,
        "users": users
    });
}

/*
 * POST /v1/admins
 */

async function postAdmin(res, api, id, login) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    postAdminResponse(res, connection, userID, id, login);
}

async function postAdminResponse(res, connection, userID, id, login) {
    const hasOwnerPerms = isOwner(res, connection, userID);

    if (!hasOwnerPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an owner of ApuJar."
        });
                
        return;
    }

    const admins = await getAllAdmins(res, connection);
    const adminAlreadyExists = admins.some(row => row.userID === id);

    if (adminAlreadyExists) {
        res.status(409).jsonp({
            "status": 409,
            "message": `Admin with id '${id}' already exists.`
        });
                
        return;
    }

    const owners = await getAllOwners(res, connection);
    const ownerAlreadyExists = owners.some(row => row.userID === id);

    if (ownerAlreadyExists) {
        res.status(409).jsonp({
            "status": 409,
            "message": `Owner with id '${id}' already exists.`
        });
                
        return;
    }

    const query = "INSERT INTO `admins`(`userID`, `userLogin`, `isOwner`) VALUES(?, ?, ?)";
    const values = [id, login, false];
    
    await requestDatabase(connection, query, values, res);
    getAdminsResponse(res, connection, userID);
}

/*
 * DELETE /v1/admins/:admin_id
 */

async function deleteAdmin(res, api, adminID) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    deleteAdminResponse(res, connection, userID, adminID);
}

async function deleteAdminResponse(res, connection, userID, adminID) {
    const hasOwnerPerms = isOwner(res, connection, userID);

    if (!hasOwnerPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an owner of ApuJar."
        });
                
        return;
    }

    const admins = await getAllAdmins(res, connection);
    const exists = admins.some(row => row.userID === adminID);

    if (!exists) {
        res.status(404).jsonp({
            "status": 404,
            "message": `Admin with id '${adminID}' doesn't exist.`
        });
                
        return;
    }

    const query = "DELETE FROM `admins` WHERE `userID` = ?";
    const values = [adminID];
    
    await requestDatabase(connection, query, values, res);
    getAdminsResponse(res, connection, userID);
}

/*
 * PATCH /v1/admins/:admin_id
 */

async function patchAdmin(res, api, adminID, login) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    patchAdminResponse(res, connection, userID, adminID, login);
}

async function patchAdminResponse(res, connection, userID, adminID, login) {
    const hasOwnerPerms = isOwner(res, connection, userID);

    if (!hasOwnerPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an owner of ApuJar."
        });
                
        return;
    }

    const admins = await getAllAdmins(res, connection);
    const exists = admins.some(row => row.userID === adminID);

    if (!exists) {
        res.status(404).jsonp({
            "status": 404,
            "message": `Admin with id '${adminID}' doesn't exist.`
        });
                
        return;
    }

    const admin = admins.find(row => row.userID === adminID);
    const adminLogin = admin.userLogin;

    if (adminLogin === login) {
        res.status(409).jsonp({
            "status": 409,
            "message": "The old login is the same as the new one."
        });
                
        return;
    }

    const query = "UPDATE `admins` SET `userLogin` = ? WHERE `userID` = ?";
    const values = [login, adminID];
    
    await requestDatabase(connection, query, values, res);
    getAdminsResponse(res, connection, userID);
}

/*
 * GET /v1/owners/:owner_id
 */

async function getOwner(res, api, ownerID) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    getOwnerResponse(res, connection, userID, ownerID);
}

async function getOwnerResponse(res, connection, userID, ownerID) {
    const hasOwnerPerms = isOwner(res, connection, userID);

    if (!hasOwnerPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an owner of ApuJar."
        });
                
        return;
    }

    const query = "SELECT * FROM `admins` WHERE `userID` = ? AND `isOwner` = ?";
    const values = [ownerID, true];

    const [results] = await requestDatabase(connection, query, values, res);
    const rows = results[0];

    if (rows.length === 0) {
        res.status(404).jsonp({
            "status": 404,
            "message": `No owner with id '${ownerID}' found.`
        });
                
        return;
    }

    const row = rows[0];

    res.jsonp({
        "status": 200,
        "user": {
            "id": row.userID,
            "login": row.userLogin
        }
    });
}

/*
 * GET /v1/owners
 */

async function getOwners(res, api) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    getOwnersResponse(res, connection, userID);
}

async function getOwnersResponse(res, connection, userID) {
    const query = "SELECT * FROM `admins` WHERE `isOwner` = ?";
    const values = [true];

    const [results] = await requestDatabase(connection, query, values, res);
    const rows = results[0];

    if (rows.length === 0) {
        res.status(404).jsonp({
            "status": 404,
            "message": `No owners found.`
        });
                
        return;
    }

    const isOwner = rows.some(row => row.userID === userID);

    if (!isOwner) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an owner of ApuJar."
        });
                
        return;
    }

    const users = rows.map(row => ({
        "id": row.userID,
        "login": row.userLogin
    }));

    res.jsonp({
        "status": 200,
        "users": users
    });
}

/*
 * POST /v1/owners
 */

async function postOwner(res, api, id, login) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    postOwnerResponse(res, connection, userID, id, login);
}

async function postOwnerResponse(res, connection, userID, id, login) {
    if (userID !== 755628467 && userID !== 896181679) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not a founder of ApuJar."
        });
                
        return;
    }

    const owners = await getAllOwners(res, connection);
    const ownerAlreadyExists = owners.some(row => row.userID === id);

    if (ownerAlreadyExists) {
        res.status(409).jsonp({
            "status": 409,
            "message": `Owner with id '${id}' already exists.`
        });
                
        return;
    }

    const admins = await getAllAdmins(res, connection);
    const adminAlreadyExists = admins.some(row => row.userID === id);

    let query;
    let values;

    if (adminAlreadyExists) {
        query = "UPDATE `admins` SET `isOwner` = ? WHERE `userID` = ?";
        values = [true, id];
    }

    if (!adminAlreadyExists) {
        query = "INSERT INTO `admins`(`userID`, `userLogin`, `isOwner`) VALUES(?, ?, ?)";
        values = [id, login, true];
    }
    
    await requestDatabase(connection, query, values, res);
    getOwnersResponse(res, connection, userID);
}

/*
 * DELETE /v1/owners/:owner_id
 */

async function deleteOwner(res, api, ownerID) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    deleteOwnerResponse(res, connection, userID, ownerID);
}

async function deleteOwnerResponse(res, connection, userID, ownerID) {
    if (userID !== 755628467 && userID !== 896181679) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not a founder of ApuJar."
        });
                
        return;
    }

    const owners = await getAllOwners(res, connection);
    const exists = owners.some(row => row.userID === ownerID);

    if (!exists) {
        res.status(404).jsonp({
            "status": 404,
            "message": `Owner with id '${ownerID}' doesn't exist.`
        });
                
        return;
    }

    const query = "DELETE FROM `admins` WHERE `userID` = ?";
    const values = [ownerID];
    
    await requestDatabase(connection, query, values, res);
    getOwnersResponse(res, connection, userID);
}

/*
 * PATCH /v1/owners/:owner_id
 */

async function patchOwner(res, api, ownerID, login) {
    const { response } = await getUsers(res, api);

    const data = response.data;
    const user = data[0];
    const userID = Number(user.id);

    const connection = await createDatabaseConnection();

    patchOwnerResponse(res, connection, userID, ownerID, login);
}

async function patchOwnerResponse(res, connection, userID, ownerID, login) {
    if (userID !== 755628467 && userID !== 896181679) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not a founder of ApuJar."
        });
                
        return;
    }

    const owners = await getAllOwners(res, connection);
    const exists = owners.some(row => row.userID === ownerID);

    if (!exists) {
        res.status(404).jsonp({
            "status": 404,
            "message": `Owner with id '${ownerID}' doesn't exist.`
        });
                
        return;
    }

    const owner = owners.find(row => row.userID === ownerID);
    const ownerLogin = owner.userLogin;

    if (ownerLogin === login) {
        res.status(409).jsonp({
            "status": 409,
            "message": "The old login is the same as the new one."
        });
                
        return;
    }

    const query = "UPDATE `admins` SET `userLogin` = ? WHERE `userID` = ?";
    const values = [login, ownerID];
    
    await requestDatabase(connection, query, values, res);
    getOwnersResponse(res, connection, userID);
}

/*
 * Export modules
 */

module.exports = {
    getAdmin: getAdmin,
    getAdmins: getAdmins,
    postAdmin: postAdmin,
    deleteAdmin: deleteAdmin,
    patchAdmin: patchAdmin,
    getOwner: getOwner,
    getOwners: getOwners,
    postOwner: postOwner,
    deleteOwner: deleteOwner,
    patchOwner: patchOwner
};