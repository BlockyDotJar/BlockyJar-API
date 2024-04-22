const { getAPI } = require("../../../utils/twitch");

const { param } = require("express-validator");
const { validate, validateParameter } = require("../../../utils/validator");

const responses = require("../../../responses/owners");

const schema = require("../../../resources/schema/owners/POST.json");

async function setup(app)
{
	app.route("/v1/apujar/owners")

		.get((req, res) =>
		{
			const api = getAPI(req, res);
			responses.getOwners(res, api);
		})

		.post((req, res) =>
		{
			const body = req.body;
			const valid = validate(body, schema, res);
	
			if (!valid)
			{
				return;
			}

			const userID = Number(body.user_id);
			const userLogin = body.user_login;

			const api = getAPI(req, res);

			responses.postOwner(res, api, userID, userLogin);
		});

	app.route("/v1/apujar/owners/:owner_id", param("owner_id").isInt())

		.get((req, res) =>
		{
			const params = req.params;
			const valid = validateParameter(req, "owner_id", "number", res);

			if (!valid)
			{
				return;
			}

			const ownerID = Number(params.owner_id);
			const api = getAPI(req, res);

			responses.getOwner(res, api, ownerID);
		})

		.delete((req, res) => 
		{
			const params = req.params;
			const valid = validateParameter(req, "owner_id", "number", res);

			if (!valid)
			{
				return;
			}

			const ownerID = Number(params.owner_id);
			const api = getAPI(req, res);

			responses.deleteOwner(res, api, ownerID);
		});
}

/*
 * Export modules
 */

module.exports.setup = setup;