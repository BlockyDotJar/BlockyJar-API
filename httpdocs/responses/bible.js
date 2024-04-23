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
    const addedAt = row.added_at;
    const id = row.userID;
    const login = row.userLogin;

    return res.jsonp
    (
        {
            "status": 200,
            "page": page,
            "entry": entry,
            "added_at": addedAt,
            "user": {
                "id": id,
                "login": login
            }
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
        const addedAt = entry.added_at;
        const id = entry.userID;
        const login = entry.userLogin;

        return {
                    "page": biblePage,
                    "entry": bibleEntry,
                    "added_at": addedAt,
                    "user": {
                        "id": id,
                        "login": login
                    }
               };
    });

    return res.jsonp
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

async function postBibleEntry(res, api, bibleEntry, bibleUserID)
{
    const { userID } = await getUsers(res, api);
    const { userLogin } = await getUsersByID(res, api, bibleUserID);
    const connection = await mysql.createDatabaseConnection();

    postBibleEntryResponse(res, connection, bibleEntry, bibleUserID, userID, userLogin);
}

async function postBibleEntryResponse(res, connection, bibleEntry, bibleUserID, userID, userLogin)
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
    const page = bibleEntries.length + 1;
    const addedAt = date.toISOString();

    const query = "INSERT INTO `bible`(`page`, `entry`, `addedAt`, `userID`, `userLogin`) VALUES(?, ?, ?, ?, ?)";
    const values = [ page, bibleEntry, addedAt, bibleUserID, userLogin ];

    await mysql.requestDatabase(connection, query, values, res);

    getBibleEntriesResponse(res, connection, null, false, userID);
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

    getBibleEntriesResponse(res, connection, null, false, userID);
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

    const query = "UPDATE `bible` SET `entry` = ? WHERE `page` = ?";
    const values = [ bibleEntry, biblePage ];

    await mysql.requestDatabase(connection, query, values, res);

    getBibleEntriesResponse(res, connection, null, false, userID);
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