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
 * Export modules
 */

module.exports = {
    getAPI: getAPI,
    getUsers: getUsers
};