const { createDatabaseConnection, requestDatabase, getAllAdmins, isAdmin } = require("../utils/mysql-utils");
const TwitchJs = require("twitch-js").default;

/*
 * General Twitch utility functions
 */

const getAPIClient = (token, clientId) => {
    return new TwitchJs({ token, clientId }).api;
}

const getAPI = (req, res) => {
    const token = req.get("Authorization");
    const clientId = req.get("Client-Id");

    if (!token || !clientId) {
        res.status(401).jsonp({
            "status": 401,
            "message": "Authorization and Client-Id headers must be specified."
        });

        return;
    }

    const authParts = token.startsWith("Bearer") ? token.split(" ") : null;
    const accessToken = authParts ? authParts[1] : token;

    return getAPIClient(accessToken, clientId);
}

const getUsers = (res, api) => {
    return api.get("users")
        .then(response => ({ response }) )
        .catch(err => {
            const errorMessage = err.message;

            res.status(400).jsonp({
                "status": 400,
                "message": errorMessage
            });
        });
}

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
};

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
    const query = "SELECT * FROM `admins`";

    const [results] = await requestDatabase(connection, query, [], res);
    const rows = results[0];

    if (rows.length === 0) {
        res.status(404).jsonp({
            "status": 404,
            "message": `No admins found.`
        });
                
        return;
    }

    const isAdmin = rows.some(row => row.userID === userID);

    if (!isAdmin) {
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
};

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
    const hasAdminPerms = isAdmin(res, connection, userID);

    if (!hasAdminPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an admin of ApuJar."
        });
                
        return;
    }

    const admins = await getAllAdmins(res, connection);
    const alreadyExists = admins.some(row => row.userID === id);

    if (alreadyExists) {
        res.status(409).jsonp({
            "status": 409,
            "message": `Admin with id '${id}' already exists.`
        });
                
        return;
    }

    const query = "INSERT INTO `admins`(`userID`, `userLogin`) VALUES(?, ?)";
    const values = [id, login];
    
    await requestDatabase(connection, query, values, res);
    getAdminsResponse(res, connection, userID);
};

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
    const hasAdminPerms = isAdmin(res, connection, userID);

    if (!hasAdminPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an admin of ApuJar."
        });
                
        return;
    }

    const admins = await getAllAdmins(res, connection);
    const exists = admins.some(row => row.userID === adminID);

    if (!exists) {
        res.status(404).jsonp({
            "status": 404,
            "message": `Admin with id '${adminID}' doesn't exist`
        });
                
        return;
    }

    const query = "DELETE FROM `admins` WHERE `userID` = ?";
    const values = [adminID];
    
    await requestDatabase(connection, query, values, res);
    getAdminsResponse(res, connection, userID);
};

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
    const hasAdminPerms = isAdmin(res, connection, userID);

    if (!hasAdminPerms) {
         res.status(403).jsonp({
            "status": 403,
            "message": "You are not an admin of ApuJar."
        });
                
        return;
    }

    const admins = await getAllAdmins(res, connection);
    const exists = admins.some(row => row.userID === adminID);

    if (!exists) {
        res.status(404).jsonp({
            "status": 404,
            "message": `Admin with id '${adminID}' doesn't exist`
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
};

/*
 * Export modules
 */

module.exports = {
    getAPI: getAPI,
    getAdmin: getAdmin,
    getAdmins: getAdmins,
    postAdmin: postAdmin,
    deleteAdmin: deleteAdmin,
    patchAdmin: patchAdmin
};