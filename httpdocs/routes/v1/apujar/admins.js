const { getAPI } = require("../../../utils/twitch");

const { param } = require("express-validator");
const { validate, validateParameter } = require("../../../utils/validator");

const responses = require("../../../utils/responses/admins");

const schema = require("../../../resources/schema/admins/POST.json");

async function setup(app)
{
	app.route("/v1/apujar/admins")

		.get((req, res) =>
		{
			const api = getAPI(req, res);
			responses.getAdmins(res, api);
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

			responses.postAdmin(res, api, userID, userLogin);
		});

	app.route("/v1/apujar/admins/:admin_id", param("admin_id").isInt())

		.get((req, res) =>
		{
			const params = req.params;
			const valid = validateParameter(req, "admin_id", res);

			if (!valid)
			{
				return;
			}

			const adminID = Number(params.admin_id);
			const api = getAPI(req, res);

			responses.getAdmin(res, api, adminID);
		})

		.delete((req, res) =>
		{
			const params = req.params;
			const valid = validateParameter(req, "admin_id", res);

			if (!valid)
			{
				return;
			}

			const adminID = Number(params.admin_id);
			const api = getAPI(req, res);

			responses.deleteAdmin(res, api, adminID);
		});
}

/*
 * Export modules
 */

module.exports.setup = setup;