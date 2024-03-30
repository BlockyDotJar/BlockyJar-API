const { getAPI } = require("../../../utils/twitch");
const { param, validationResult } = require("express-validator");
const { Validator } = require("jsonschema");

const responses = require("../../../utils/responses/admins");

const schema = require("../../../resources/schema/POST-admins.json");

module.exports.setup = (app) => {
	app.route("/v1/apujar/admins")
		.get((req, res) => {
			const api = getAPI(req, res);

			responses.getAdmins(res, api);
		})
		.post((req, res) => {
			const validator = new Validator();
			const validationResult = validator.validate(req.body, schema);
	
			if (!validationResult.valid) {
				const errors = validationResult.errors.map(error => `${error.property} ${error.message}.`);
	
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": errors
					}
				);
			}

			const id = Number(req.body.id);
			const login = req.body.login;

			const api = getAPI(req, res);

			responses.postAdmin(res, api, id, login);
		});

	app.route("/v1/apujar/admins/:admin_id", param("admin_id").isInt())
		.get((req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": [ "param.admin_id is not of a type(s) number." ]
					}
				);
			}

			const adminID = Number(req.params.admin_id);

			const api = getAPI(req, res);

			responses.getAdmin(res, api, adminID);
		})
		.delete((req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": [ "param.admin_id is not of a type(s) number." ]
					}
				);
			}

			const adminID = Number(req.params.admin_id);

			const api = getAPI(req, res);

			responses.deleteAdmin(res, api, adminID);
		});
};