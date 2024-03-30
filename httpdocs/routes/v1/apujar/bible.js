const { getAPI } = require("../../../utils/twitch");
const { param, query, validationResult } = require("express-validator");
const { Validator } = require("jsonschema");

const responses = require("../../../utils/responses/bible");

const postSchema = require("../../../resources/schema/POST-bible.json");
const patchSchema = require("../../../resources/schema/PATCH-bible.json");

module.exports.setup = (app) => {
	app.route("/v1/apujar/bible")
		.get(query("limit").optional().isInt(), query("random").optional().isBoolean(), (req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				const errors = result.array().map(error => {
					const path = error.path;
					const type = path === "limit" ? "number" : "boolean";

					return `query.${path} is not of a type(s) ${type}.`
				});

				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": errors
					}
				);
			}

			const limit = Number(req.query.limit);
			const random = Boolean(req.query.random);

			const api = getAPI(req, res);

			responses.getBibleEntries(res, api, limit, random)
		})
		.post((req, res) => {
			const validator = new Validator();
			const validationResult = validator.validate(req.body, postSchema);
	
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

			const userID = Number(req.body.user_id);
			const entry = req.body.entry;

            const api = getAPI(req, res);

			responses.postBibleEntry(res, api, entry, userID);
		});

	app.route("/v1/apujar/bible/:bible_page", param("bible_page").isInt())
		.get((req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": [ "param.bible_page is not of a type(s) number." ]
					}
				);
			}

			const biblePage = Number(req.params.bible_page);

            const api = getAPI(req, res);

			responses.getBibleEntry(res, api, biblePage);
		})
		.delete((req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": [ "param.bible_page is not of a type(s) number." ]
					}
				);
			}

			const biblePage = Number(req.params.bible_page);

            const api = getAPI(req, res);

			responses.deleteBibleEntry(res, api, biblePage);
		})
		.patch((req, res) => {
			const result = validationResult(req);

			if (!result.isEmpty()) {
				return res.status(400).jsonp
				(
					{
						"status": 400,
						"errors": [ "param.bible_page is not of a type(s) number." ]
					}
				);
			}

			const biblePage = Number(req.params.bible_page);

			const validator = new Validator();
			const validationResult = validator.validate(req.body, patchSchema);
	
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

			const entry = req.body.entry;

            const api = getAPI(req, res);

			responses.patchBibleEntry(res, api, biblePage, entry);
		});
};