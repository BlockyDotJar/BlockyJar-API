const mysql = require("../utils/mysql");
const { getUsers, getUsersByID } = require("../utils/twitch");

/*
 * GET /v1/apujar/bible/:bible_page
 */

async function getBibleEntry(res, api, biblePage)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    getBibleEntryResponse(res, connection, biblePage, userID);
}

async function getBibleEntryResponse(res, connection, biblePage, userID)
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

    const bibleEntries = await mysql.getAllBibleEntries(res, connection);
    
    const bibleEntryExists = bibleEntries.some(entry =>
    {
        const entryPage = entry.page;
        return entryPage === biblePage;
    });

    if (!bibleEntryExists)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No bible entry for page ${biblePage} found. (Note, that the page could also have been deleted)`
            }
        );
    }

    const row = bibleEntries[biblePage - 1];
    const page = row.page;
    const entry = row.entry;
    const addedAt = row.addedAt;
    const updatedAt = row.updatedAt;
    const id = row.userID;
    const login = row.userLogin;

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "page": page,
            "entry": entry,
            "user": {
                "id": id,
                "login": login
            },
            "added_at": addedAt,
            "updated_at": updatedAt
        }
    );
}

/*
 * GET /v1/apujar/bible
 */

async function getBibleEntries(res, api, limit, random)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    getBibleEntriesResponse(res, connection, limit, random, userID);
}

async function getBibleEntriesResponse(res, connection, limit, random, userID)
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

    let query = "SELECT * FROM `bible`";
    let values = [];

    if (random)
    {
        query += " ORDER BY RAND()";
    }

    if (limit) 
    {
        query += " LIMIT ?";
        values.push(limit);
    }

    const [ results ] = await mysql.requestDatabase(connection, query, values, res);

    const bibleEntries = results[0];

    const entries = bibleEntries.map(entry =>
    {
        const biblePage = entry.page;
        const bibleEntry = entry.entry;
        const addedAt = entry.addedAt;
        const updatedAt = entry.updatedAt;
        const id = entry.userID;
        const login = entry.userLogin;

        return {
                    "page": biblePage,
                    "entry": bibleEntry,
                    "user": {
                        "id": id,
                        "login": login
                    },
                    "added_at": addedAt,
                    "updated_at": updatedAt
               };
    });

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "entries": entries
        }
    );
}

/*
 * POST /v1/apujar/bible
 */

async function postBibleEntry(res, api, bibleEntry, addedAt, updatedAt, bibleUserID)
{
    const { userID } = await getUsers(res, api);
    const { userLogin } = await getUsersByID(res, api, bibleUserID);
    const connection = await mysql.createDatabaseConnection();

    postBibleEntryResponse(res, connection, bibleEntry, addedAt, updatedAt, bibleUserID, userID, userLogin);
}

async function postBibleEntryResponse(res, connection, bibleEntry, addedAtRaw, updatedAtRaw, bibleUserID, userID, userLogin)
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

    const bibleEntries = await mysql.getAllBibleEntries(res, connection);

    const bibleEntryAlreadyExists = bibleEntries.some(row =>
    {
        const entry = row.entry;
        return entry === bibleEntry;
    });

    if (bibleEntryAlreadyExists)
    {
        return res.status(409).jsonp
        (
            {
                "status": 409,
                "message": "A bible entry with the exact same message already exists."
            }
        );
    }

    const date = new Date();
    const isoDate = date.toISOString();

    const page = bibleEntries.length + 1;
    const addedAt = !addedAtRaw ? isoDate : addedAtRaw;
    const updatedAt = !updatedAtRaw ? isoDate : updatedAtRaw;

    if (addedAt > isoDate || updatedAt > isoDate)
    {
        return res.status(400).jsonp
        (
            {
                "status": 400,
                "message": "Either or both of the 'added_at' or the 'updated_at' values are in the future."
            }
        );
    }

    if (addedAt > updatedAt)
    {
        return res.status(400).jsonp
        (
            {
                "status": 400,
                "message": "The 'updated_at' value lies in the past compared to the 'added_at' value."
            }
        );
    }

    const query = "INSERT INTO `bible`(`page`, `entry`, `addedAt`, `updatedAt`, `userID`, `userLogin`) VALUES(?, ?, ?, ?, ?, ?)";
    const values = [ page, bibleEntry, addedAt, updatedAt, bibleUserID, userLogin ];

    await mysql.requestDatabase(connection, query, values, res);

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "page": page,
            "entry": bibleEntry,
            "user": {
                "id": bibleUserID,
                "login": userLogin
            },
            "added_at": addedAt,
            "updated_at": updatedAt
        }
    );
}

/*
 * DELETE /v1/apujar/bible/:bible_page
 */

async function deleteBibleEntry(res, api, biblePage)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    deleteBibleEntryResponse(res, connection, biblePage, userID);
}

async function deleteBibleEntryResponse(res, connection, biblePage, userID)
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

    const bibleEntries = await mysql.getAllBibleEntries(res, connection);
    
    const bibleEntryExists = bibleEntries.some(entry =>
    {
        const entryPage = entry.page;
        return entryPage === biblePage;
    });

    if (!bibleEntryExists)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No bible entry for page ${biblePage} found. (Note, that the page could also have been deleted)`
            }
        );
    }

    const query = "DELETE FROM `bible` WHERE `page` = ?";
    const values = [ biblePage ];

    await mysql.requestDatabase(connection, query, values, res);

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "message": `Successfully deleted bible entry page ${biblePage}.`
        }
    );
}

/*
 * PATCH /v1/apujar/bible/:bible_page
 */

async function patchBibleEntry(res, api, biblePage, bibleEntry)
{
    const { userID } = await getUsers(res, api);
    const connection = await mysql.createDatabaseConnection();

    patchBibleEntryResponse(res, connection, biblePage, bibleEntry, userID);
}

async function patchBibleEntryResponse(res, connection, biblePage, bibleEntry, userID)
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

    const bibleEntries = await mysql.getAllBibleEntries(res, connection);

    const bibleEntryExists = bibleEntries.some(entry =>
    {
        const entryPage = entry.page;
        return entryPage === biblePage;
    });

    if (!bibleEntryExists)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No bible entry for page ${biblePage} found. (Note, that the page could also have been deleted)`
            }
        );
    }

    const row = bibleEntries[biblePage - 1];
    const entry = row.entry;

    if (entry === bibleEntry)
    {
        return res.status(409).jsonp
        (
            {
                "status": 409,
                "message": "The old entry is the exact same as the new one."
            }
        );
    }

    const page = entry.page;
    const id = row.userID;
    const login = row.userLogin;
    const addedAt = row.addedAt;

    const date = new Date();
    const updatedAt = date.toISOString();

    const query = "UPDATE `bible` SET `entry` = ?, `updatedAt` = ? WHERE `page` = ?";
    const values = [ bibleEntry, updatedAt, biblePage ];

    await mysql.requestDatabase(connection, query, values, res);

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "page": page,
            "entry": entry,
            "user": {
                "id": id,
                "login": login
            },
            "added_at": addedAt,
            "updated_at": updatedAt
        }
    );
}

/*
 * Export modules
 */

module.exports =
{
    getBibleEntry: getBibleEntry,
    getBibleEntries: getBibleEntries,
    postBibleEntry: postBibleEntry,
    deleteBibleEntry: deleteBibleEntry,
    patchBibleEntry: patchBibleEntry
};