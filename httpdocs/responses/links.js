const { v4: uuidv4 } = require("uuid");
const base58 = require("bs58");

const { DateTime } = require("dateutils");

const mysql = require("../utils/mysql");

/*
 * Utility functions
 */

async function getID(res)
{
    const textEncoder = new TextEncoder();

    const uuid = uuidv4();

    const bytes = textEncoder.encode(uuid);
    const base58UUID = base58.encode(bytes);
    const id = base58UUID.substring(0, 11);

    const connection = await mysql.createDatabaseConnection();
    const links = await mysql.getAllLinks(res, connection);

    const link = links.find(link =>
    {
        const linkID = link.id;
        return linkID === id;
    });

    if (link)
    {
        return getID(links);
    }

    return [ id, uuid ];
}

/*
 * POST /v1/links
 */

async function createLink(res, link, expiresOn) 
{
    const nextWeek = DateTime.now().plusDays(7);
    const expireDate = nextWeek.toISODateString();

    const [ id, uuid ] = await getID(res);
    const expires = expiresOn || expireDate;

    const now = Date.now();
    const expiresDate = Date.parse(expires);

    if (now > expiresDate)
    {
        return res.status(400).jsonp
        (
            {
                "status": 400,
                "message": "JSON object 'expires_on' must be in the future."
            }
        );
    }

    const connection = await mysql.createDatabaseConnection();

    const query = "INSERT INTO `links`(`id`, `uuid`, `link`, `expiresOn`) VALUES(?, ?, ?, ?)";
    const values = [ id, uuid, link, String(expires) ];

    await mysql.requestDatabase(connection, query, values, res);

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "id": id,
            "uuid": uuid,
            "expires_on": expires,
            "link": `https://links.blockyjar.dev/${id}`,
            "redirect_to": link
        }
    );
}

/*
 * GET /v1/links/:link_uuid
 */

async function getLink(res, uuid)
{
    const connection = await mysql.createDatabaseConnection();
    const validUUID = await mysql.isValidUUID(res, connection, uuid);

    if (!validUUID)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No link for uuid '${uuid}' found.`
            }
        );
    }

    const links = await mysql.getAllLinks(res, connection);

    const link = links.find(link =>
    {
        const linkUUID = link.uuid;
        return linkUUID === uuid;
    });

    const id = link.id;
    const expiresOn = link.expiresOn;
    const redirectTo = link.link;

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "id": id,
            "expires_on": expiresOn,
            "link": `https://links.blockyjar.dev/${id}`,
            "redirect_to": redirectTo
        }
    );
}

/*
 * DELETE /v1/links/:link_uuid
 */
async function deleteLink(res, uuid) 
{
    const connection = await mysql.createDatabaseConnection();
    const validUUID = await mysql.isValidUUID(res, connection, uuid);

    if (!validUUID)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No link for uuid '${uuid}' found.`
            }
        );
    }

    const query = "DELETE FROM `links` WHERE `uuid` = ?";
    const values = [ uuid ];

    await mysql.requestDatabase(connection, query, values, res);

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "message": `Successfully deleted link with uuid '${uuid}'.`
        }
    );
}

/*
 * PATCH /v1/links/:link_uuid
 */

async function patchLink(res, uuid, link, expiresOn) 
{
    const connection = await mysql.createDatabaseConnection();
    const links = await mysql.getAllLinks(res, connection);

    const uuidLink = links.find(link =>
    {
        const linkUUID = link.uuid;
        return linkUUID === uuid;
    });

    if (!uuidLink)
    {
        return res.status(404).jsonp
        (
            {
                "status": 404,
                "message": `No link for uuid '${uuid}' found.`
            }
        );
    }

    if (link && uuidLink === link)
    {
        return res.status(409).jsonp
        (
            {
                "status": 409,
                "message": "The new link matches exactly with the old one."
            }
        );
    }

    const uuidExpiresOnRaw = uuidLink.expiresOn;
    const uuidExpiresOn = DateTime.fromDateObject(uuidExpiresOnRaw);

    if (expiresOn && uuidExpiresOn === expiresOn)
    {
        return res.status(409).jsonp
        (
            {
                "status": 409,
                "message": "The new expiration date matches exactly with the old one."
            }
        );
    }

    const expires = expiresOn || uuidExpiresOn.toISODateString();

    const now = Date.now();
    const expiresDate = Date.parse(expires);

    if (now > expiresDate)
    {
        return res.status(400).jsonp
        (
            {
                "status": 400,
                "message": "JSON object 'expires_on' must be in the future."
            }
        );
    }

    const query = "UPDATE `links` SET `link` = ?, `expiresOn` = ? WHERE `uuid` = ?";
    const values = [ link, String(expires), uuid ];

    await mysql.requestDatabase(connection, query, values, res);

    const id = uuidLink.id;

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "id": id,
            "uuid": uuid,
            "expires_on": expires,
            "link": `https://links.blockyjar.dev/${id}`,
            "redirect_to": link
        }
    );
}

/*
 * Export modules
 */

module.exports =
{
    createLink: createLink,
    getLink: getLink,
    deleteLink: deleteLink,
    patchLink: patchLink
}