const mysql = require("../mysql");
const { getUsers } = require("../twitch");

/*
 * PATCH /v1/apujar/internal/user/:user_id
 */

async function patchUser(res, api, id, login) {
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    patchUserResponse(res, connection, id, login, userID);
}

async function patchUserResponse(res, connection, id, login, userID) {
    const hasAdminPerms = await mysql.isAdmin(res, connection, userID);

    if (!hasAdminPerms) {
        return res.status(403).jsonp
        (
            {
                "status": 403,
                "message": "You are not an admin of ApuJar."
            }
        );
    }

    const dbTables = [ "admins", "bible" ];

    for (const table of dbTables) {
        const query = `UPDATE \`${table}\` SET \`userLogin\` = ? WHERE \`userID\` = ?`;
        const values = [login, id];
    
        await mysql.requestDatabase(connection, query, values, res);
    }

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "message": "Successfully updated all tables."
        }
    );
}

/*
 * Export modules
 */

module.exports = {
    patchUser: patchUser
};