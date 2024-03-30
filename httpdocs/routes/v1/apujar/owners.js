const { getAPI } = require("../../../utils/twitch");
const { param, validationResult } = require("express-validator");
const { Validator } = require("jsonschema");

const responses = require("../../../utils/responses/owners");

const schema = require("../../../resources/schema/POST-owners.json");

module.exports.setup = (app) => {
	app.route("/v1/apujar/owners")
		.get((req, res) => {
			const api = getAPI(req, res);

			responses.getOwners(res, api);
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

			responses.postOwner(res, api, id, login);
		});

	app.route("/v1/apujar/owners/:owner_id", param("owner_id").isInt())
		.get((req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": [ "param.owner_id is not of a type(s) number." ]
					}
				);
			}

			const ownerID = Number(req.params.owner_id);

			const api = getAPI(req, res);

			responses.getOwner(res, api, ownerID);
		})
		.delete((req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": [ "param.owner_id is not of a type(s) number." ]
					}
				);
			}

			const ownerID = Number(req.params.owner_id);

			const api = getAPI(req, res);

			responses.deleteOwner(res, api, ownerID);
		});
};