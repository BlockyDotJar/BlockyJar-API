const BASE_ROUTE_SUCCESS =
{
    "status": 200,
    "message": "Hello World!",
    "version": "2",
    "base_url": "https://api.blockyjar.dev/v2",
    "docs_url": "https://api.blockyjar.dev/v2/docs/"
};

const REGEX_GENERATOR_SUCCESS = (regex) =>
({
    "status": 200,
    "regex": regex
});

const LINK_POST_SUCCESS = (id, uuid, expiresOn, deleteExpiredDetails, redirectTo) =>
({
    "status": 200,
    "id": id,
    "uuid": uuid,
    "expires_on": expiresOn,
    "delete_expired_details": deleteExpiredDetails,
    "link": `https://blcky.link/${id}`,
    "redirect_to": redirectTo
});

const LINK_GET_SUCCESS = (id, expiresOn, deleteExpiredDetails, redirectTo, additionalInformation) =>
({
    "status": 200,
    "id": id,
    "expires_on": expiresOn,
    "delete_expired_details": deleteExpiredDetails,
    "link": `https://blcky.link/${id}`,
    "redirect_to": redirectTo,
    "additional_information": additionalInformation
});

const LINK_DELETE_SUCCESS = (uuid, linkDetails) =>
({
    "status": 200,
    "message": `Successfully deleted link with uuid '${uuid}'.`,
    "link_details": linkDetails
});

const LINK_DELETE_DETAILS_SUCCESS = (uuid, linkDetails) =>
({
    "status": 200,
    "message": `Successfully deleted link details for uuid '${uuid}'.`,
    "link_details": linkDetails
});

const LINK_PATCH_SUCCESS = (id, uuid, expiresOn, deleteExpiredDetails, redirectTo, linkHistory, dateHistory) =>
({
    "status": 200,
    "id": id,
    "uuid": uuid,
    "expires_on": expiresOn,
    "delete_expired_details": deleteExpiredDetails,
    "link": `https://blcky.link/${id}`,
    "redirect_to": redirectTo,
    "link_history": linkHistory,
    "date_history": dateHistory
});

const VALIDATOR_ERRORS_BAD_REQUEST = (errors) =>
({
    "status": 400,
    "errors": errors
});

const VALIDATOR_TYPE_SAFETY_ERRORS_BAD_REQUEST = (paramID, paramType) =>
({
    "status": 400,
    "errors": [ `param.${paramID} is not of a type(s) ${paramType}.` ]
});

const VALIDATOR_MULTIPLE_TYPE_SAFETY_ERRORS_BAD_REQUEST = (errors) =>
({
        "status": 400,
        "errors": errors
});

const REGEX_GENERATOR_MISSING_PATTERN =
{
    "status": 400,
    "message": "Please specify at least one pattern."
};

const LINK_EXPIRES_ON_NOT_IN_FUTURE =
{
    "status": 400,
    "message": "JSON object 'expires_on' must be in the future."
};

const LINK_UUID_FOUND = (uuid) =>
({
    "status": 400,
    "message": `Link for uuid '${uuid}' was found. You can only delete link details from deleted links.`
});    

const LINK_ID_UUID_NOT_FOUND = 
{
    "status": 404,
    "message": "Can't find any id / uuid to get information from a link."
};

const LINK_UUID_NOT_FOUND = (uuid) =>
({
    "status": 404,
    "message": `No link for uuid '${uuid}' found.`
});

const LINK_ID_NOT_FOUND = (id) =>
({
    "status": 404,
    "message": `No link for id '${id}' found.`
});

const LINK_DETAILS_NOT_FOUND = (uuid) =>
({
    "status": 404,
    "message": `No link details for uuid '${uuid}' found.`
});

const LINK_URL_CONFLICT =
{
    "status": 409,
    "message": "The new link matches exactly with the old one."
};

const LINK_EXPIRATION_DATE_CONFLICT =
{
    "status": 409,
    "message": "The new expiration date matches exactly with the old one."
};

const LINK_DELETE_EXPIRED_DETAILS_CONFLICT =
{
    "status": 409,
    "message": "The new value for the deletion of the details of expired links matches exactly with the old one."
};

const UNPROCESSABLE_ENTITY = (error) =>
({
    "status": 422,
    "message": error.message
});

const RATELIMIT_REACHED =
{
    "status": 429,
    "message": "Too many requests - Rate limit exceeded. You can only make 5 requests per second to this endpoint."
};

/*
 * Export modules
 */

module.exports =
{
    BASE_ROUTE_SUCCESS,
    REGEX_GENERATOR_SUCCESS,
    LINK_POST_SUCCESS,
    LINK_GET_SUCCESS,
    LINK_DELETE_SUCCESS,
    LINK_DELETE_DETAILS_SUCCESS,
    LINK_PATCH_SUCCESS,
    VALIDATOR_ERRORS_BAD_REQUEST,
    VALIDATOR_TYPE_SAFETY_ERRORS_BAD_REQUEST,
    VALIDATOR_MULTIPLE_TYPE_SAFETY_ERRORS_BAD_REQUEST,
    REGEX_GENERATOR_MISSING_PATTERN,
    LINK_EXPIRES_ON_NOT_IN_FUTURE,
    LINK_UUID_FOUND,
    LINK_ID_UUID_NOT_FOUND,
    LINK_UUID_NOT_FOUND,
    LINK_ID_NOT_FOUND,
    LINK_DETAILS_NOT_FOUND,
    LINK_URL_CONFLICT,
    LINK_EXPIRATION_DATE_CONFLICT,
    LINK_DELETE_EXPIRED_DETAILS_CONFLICT,
    UNPROCESSABLE_ENTITY,
    RATELIMIT_REACHED
};