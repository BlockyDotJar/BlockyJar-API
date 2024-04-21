const { getAPI } = require("../../../../utils/twitch");

const { param } = require("express-validator");
const { validate, validateParameter } = require("../../../../utils/validator");

const responses = require("../../../../utils/responses/user");

const schema = require("../../../../resources/schema/user/PATCH.json");

async function setup(app)
{
	app.patch("/v1/apujar/internal/user/:user_id", param("user_id").isInt(), (req, res) =>
    {
        const params = req.params;
        const body = req.body;

        let valid = validateParameter(req, "user_id", "number", res);

        if (!valid)
        {
            return;
        }

        const userID = Number(params.user_id);

        valid = validate(body, schema, res);

        if (!valid)
        {
            return;
        }

        const userLogin = params.user_login;
        const api = getAPI(req, res);

        responses.patchUser(res, api, userID, userLogin);
    });
}

/*
 * Export modules
 */

module.exports.setup = setup;