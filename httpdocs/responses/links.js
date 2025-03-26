const { v4: uuidv4 } = require("uuid");
const base58 = require("bs58").default;

const { DateTime } = require("dateutils");

const mysql = require("../utils/mysql");
const responses = require("../utils/responses");

/*
 * Utility functions
 */

async function createLinkIdentification(res)
{
    const textEncoder = new TextEncoder();

    const uuid = uuidv4();

    const bytes = textEncoder.encode(uuid);
    const base58UUID = base58.encode(bytes);
    const id = base58UUID.substring(0, 11);

    const connection = await mysql.createDatabaseConnection(false);
    const link = await mysql.getLinkByID(res, connection, id);

    connection.end();

    if (link)
    {
        return createLinkIdentification(res);
    }

    return [ id, uuid ];
}

/*
 * POST /v2/links
 */

async function createLink(res, link, expiresOn, deleteExpiredDetails) 
{
    const nextWeek = DateTime.now().plusDays(7);
    const expireDate = nextWeek.toISODateString();

    const [ id, uuid ] = await createLinkIdentification(res);
    const expires = expiresOn || expireDate;

    const now = Date.now();
    const expiresDate = Date.parse(expires);

    const delExpiredDetails = deleteExpiredDetails === undefined ? false : deleteExpiredDetails;

    if (now > expiresDate)
    {
        return res.status(400).jsonp(responses.LINK_EXPIRES_ON_NOT_IN_FUTURE);
    }

    const connection = await mysql.createDatabaseConnection(true);

    const details = JSON.stringify
    ({
        "total_count": 0,
        "details": [ ]
    });

    const dateChangeHistory = JSON.stringify
    ({
        "origin_date": expires,
        "history": [ ]
    });

    const linkChangeHistory = JSON.stringify
    ({
        "origin_link": link,
        "history": [ ]
    });

    await mysql.insertLink(res, connection, uuid, id, link, expires, delExpiredDetails, details, dateChangeHistory, linkChangeHistory);

    connection.end();

    const response = responses.LINK_POST_SUCCESS(id, uuid, expires, delExpiredDetails, link);

    return res.status(200).jsonp(response);
}

/*
 * GET /v2/links/:link_uuid
 * GET /v2/links?link_id=:link_id&additional_information=:additional_information
 */

async function getLink(res, linkID, uuid, additionalInformation)
{
    const connection = await mysql.createDatabaseConnection(false);

    if (!linkID && !uuid)
    {
        return res.status(404).jsonp(responses.LINK_ID_UUID_NOT_FOUND);
    }

    let link;

    if (uuid)
    {
        const validUUID = await mysql.isValidUUID(res, connection, uuid);

        if (!validUUID)
        {
            const response = responses.LINK_UUID_NOT_FOUND(uuid);
            return res.status(404).jsonp(response);
        }

        link = await mysql.getLink(res, connection, uuid);
    }

    if (linkID)
    {
        const validLinkID = await mysql.isValidID(res, connection, linkID);
    
        if (!validLinkID)
        {
            const response = responses.LINK_ID_NOT_FOUND(linkID);
            return res.status(404).jsonp(response);
        }
    
        link = await mysql.getLinkByID(res, connection, linkID);
    }

    const id = link.id;
    const expiresOn = link.expiresOn;
    const deleteExpiredDetails = link.deleteExpiredDetails === 1;
    const redirectTo = link.link;

    let additionalDetails;

    if (additionalInformation === "true" && uuid)
    {
        const linkImpressions = await mysql.getLinkImpressions(res, connection, uuid)
        const linkDetails = linkImpressions.details;
        const details = JSON.parse(linkDetails);

        const linkDateHistory = await mysql.getLinkDateHistory(res, connection, uuid);
        const linkDateH = linkDateHistory.history;
        const dateHistory = JSON.parse(linkDateH);

        const linkURLHistory = await mysql.getLinkURLHistory(res, connection, uuid);
        const linkURLH = linkURLHistory.history;
        const urlHistory = JSON.parse(linkURLH);

        additionalDetails =
        {
            "impression_details": details,
            "date_history": dateHistory,
            "url_history": urlHistory
        };
    }

    connection.end();

    const response = responses.LINK_GET_SUCCESS(id, expiresOn, deleteExpiredDetails, redirectTo, additionalDetails);

    return res.status(200).jsonp(response);
}

/*
 * DELETE /v2/links/:link_uuid
 */
async function deleteLink(res, uuid, deleteDetails, additionalInformation) 
{
    const connection = await mysql.createDatabaseConnection(true);
    const validUUID = await mysql.isValidUUID(res, connection, uuid);

    if (!validUUID)
    {
        const response = responses.LINK_UUID_NOT_FOUND(uuid);
        return res.status(404).jsonp(response);
    }

    if (deleteDetails)
    {
        await mysql.deleteLinkDetails(res, connection, uuid);
    }

    let linkInformation;

    if (additionalInformation)
    {
        const link = await mysql.getLink(res, connection, uuid);
        const id = link.id;
        const expiresOn = link.expiresOn;
        const redirectTo = link.link;
        const deleteExpiredDetails = link.deleteExpiredDetails === 1;

        const linkImpressions = await mysql.getLinkImpressions(res, connection, uuid)
        const linkDetails = linkImpressions.details;
        const details = JSON.parse(linkDetails);

        const linkDateHistory = await mysql.getLinkDateHistory(res, connection, uuid);
        const linkDateH = linkDateHistory.history;
        const dateHistory = JSON.parse(linkDateH);

        const linkURLHistory = await mysql.getLinkURLHistory(res, connection, uuid);
        const linkURLH = linkURLHistory.history;
        const urlHistory = JSON.parse(linkURLH);

        linkInformation =
        {
            "id": id,
            "uuid": uuid,
            "expires_on": expiresOn,
            "delete_expired_details": deleteExpiredDetails,
            "link": `https://blcky.link/${id}`,
            "redirect_to": redirectTo,
            "delete_expired_details": deleteExpiredDetails,
            "impression_details": details,
            "date_history": dateHistory,
            "url_history": urlHistory
        };
    }

    await mysql.deleteLink(res, connection, uuid);

    connection.end();

    const response = responses.LINK_DELETE_SUCCESS(uuid, linkInformation);

    return res.status(200).jsonp(response);
}

/*
 * DELETE /v2/links/details/:link_uuid
 */
async function deleteLinkDetails(res, uuid, additionalInformation) 
{
    const connection = await mysql.createDatabaseConnection(true);
    const validUUID = await mysql.isValidUUID(res, connection, uuid);

    if (validUUID)
    {
        const response = responses.LINK_UUID_FOUND(uuid);
        return res.status(400).jsonp(response);
    }

    const linkImpressions = await mysql.getLinkImpressions(res, connection, uuid);

    if (!linkImpressions)
    {
        const response = responses.LINK_DETAILS_NOT_FOUND(uuid);
        return res.status(404).jsonp(response);
    }

    let linkInformation;

    if (additionalInformation)
    {
        const linkImpressions = await mysql.getLinkImpressions(res, connection, uuid)
        const linkDetails = linkImpressions.details;
        const details = JSON.parse(linkDetails);

        const linkDateHistory = await mysql.getLinkDateHistory(res, connection, uuid);
        const linkDateH = linkDateHistory.history;
        const dateHistory = JSON.parse(linkDateH);

        const linkURLHistory = await mysql.getLinkURLHistory(res, connection, uuid);
        const linkURLH = linkURLHistory.history;
        const urlHistory = JSON.parse(linkURLH);

        linkInformation =
        {
            "uuid": uuid,
            "impression_details": details,
            "date_history": dateHistory,
            "url_history": urlHistory
        };
    }

    await mysql.deleteLinkDetails(res, connection, uuid);

    connection.end();

    const response = responses.LINK_DELETE_DETAILS_SUCCESS(uuid, linkInformation);

    return res.status(200).jsonp(response);
}

/*
 * PATCH /v2/links/:link_uuid
 */

async function patchLink(res, uuid, link, expiresOn, deleteExpiredDetails) 
{
    const connection = await mysql.createDatabaseConnection(false);
    const uuidLink = await mysql.getLink(res, connection, uuid);

    if (!uuidLink)
    {
        const response = responses.LINK_UUID_NOT_FOUND(uuid);
        return res.status(404).jsonp(response);
    }

    const uuidURLLink = uuidLink.link;

    if (link && uuidURLLink === link)
    {
        return res.status(409).jsonp(responses.LINK_URL_CONFLICT);
    }

    const urlLink = link || uuidURLLink;
    const uuidExpiresOnRaw = uuidLink.expiresOn;
    const uuidExpiresOn = DateTime.fromDateObject(uuidExpiresOnRaw).toISODateString();

    if (expiresOn && uuidExpiresOn === expiresOn)
    {
        return res.status(409).jsonp(responses.LINK_EXPIRATION_DATE_CONFLICT);
    }

    const urlExpiresOn = expiresOn || uuidExpiresOn;

    const now = Date.now();
    const expiresDate = Date.parse(urlExpiresOn);

    if (now > expiresDate)
    {
        return res.status(400).jsonp(responses.LINK_EXPIRES_ON_NOT_IN_FUTURE);
    }

    const uuidDeleteExpiredDetails = uuidLink.deleteExpiredDetails === 1;

    if (deleteExpiredDetails !== undefined && uuidDeleteExpiredDetails === deleteExpiredDetails)
    {
        return res.status(409).jsonp(responses.LINK_DELETE_EXPIRED_DETAILS_CONFLICT);
    }
    
    const urlDeleteExpiredDetails = deleteExpiredDetails !== undefined ? deleteExpiredDetails : uuidDeleteExpiredDetails;

    await mysql.updateLink(res, connection, uuid, urlExpiresOn, urlLink, urlDeleteExpiredDetails);

    if (link)
    {
        const linkURLHistory = await mysql.getLinkURLHistory(res, connection, uuid);
        const linkHistoryRaw = linkURLHistory.history;

        const linkHistory = JSON.parse(linkHistoryRaw);
        const originLink = linkHistory.origin_link;
        const history = linkHistory.history;

        const date = new Date();
        const dateISO = date.toISOString();

        history.push
        ({
            "change_date_iso": dateISO,
            "old_link": uuidURLLink,
            "new_link": link
        });

        const details = JSON.stringify
        ({
            "original_link": originLink,
            "history": history
        });
    
        await mysql.updateLinkURLHistory(res, connection, uuid, details);
    }

    if (expiresOn)
    {
        const linkDateHistory = await mysql.getLinkDateHistory(res, connection, uuid);
        const dateHistoryRaw = linkDateHistory.history;

        const dateHistory = JSON.parse(dateHistoryRaw);
        const originDate = dateHistory.origin_date;
        const history = dateHistory.history;

        const date = new Date();
        const dateISO = date.toISOString();

        history.push
        ({
            "change_date_iso": dateISO,
            "old_date": uuidExpiresOn,
            "new_date": expiresOn
        });

        const details = JSON.stringify
        ({
            "original_date": originDate,
            "history": history
        });
    
        await mysql.updateLinkDateHistory(res, connection, uuid, details);
    }

    connection.end();

    const id = uuidLink.id;

    const response = responses.LINK_PATCH_SUCCESS(id, uuid, urlExpiresOn, urlDeleteExpiredDetails, urlLink);

    return res.status(200).jsonp(response);
}

/*
 * Export modules
 */

module.exports =
{
    createLink: createLink,
    getLink: getLink,
    deleteLink: deleteLink,
    deleteLinkDetails: deleteLinkDetails,
    patchLink: patchLink
}