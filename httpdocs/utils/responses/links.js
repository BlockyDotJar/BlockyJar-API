const { v4: uuidv4 } = require("uuid");
const base58 = require("bs58");

const { DateTime } = require("dateutils");

const mysql = require("../mysql");

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

async function createLink(res, link, expiresOn) 
{
    const nextWeek = DateTime.now().plusDays(7);
    const expireDate = nextWeek.toISODateString();

    const [ id, uuid ] = await getID(res);
    const expires = expiresOn || expireDate;

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
            "link": `https://links.blockyjar.dev/${id}`
        }
    );
}

/*
 * Export modules
 */

module.exports.createLink = createLink;