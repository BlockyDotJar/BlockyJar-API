const { getAPI } = require("../../../utils/twitch");

const { param, query } = require("express-validator");
const { validate, validateParameter, validateParameters } = require("../../../utils/validator");

const responses = require("../../../responses/bible");

const postSchema = require("../../../resources/schema/bible/POST.json");
const patchSchema = require("../../../resources/schema/bible/PATCH.json");

async function setup(app)
{
	app.route("/v1/apujar/bible")

		.get(query("limit").optional().isInt(), query("random").optional().isBoolean(), (req, res) =>
		{
			const query = req.query;
			const valid = validateParameters(req, "limit", "number", "boolean", res);

			if (!valid)
			{
				return;
			}

			const limit = Number(query.limit);
			const random = Boolean(query.random);

			const api = getAPI(req, res);

			responses.getBibleEntries(res, api, limit, random)
		})

		.post((req, res) =>
		{
			const body = req.body;
			const valid = validate(body, postSchema, res);
	
			if (!valid)
			{
				return;
			}

			const userID = Number(body.user_id);
			const entry = body.entry;
			const addedAt = body.added_at;
			const updatedAt = body.updated_at;

            const api = getAPI(req, res);

			responses.postBibleEntry(res, api, entry, addedAt, updatedAt, userID);
		});

	app.route("/v1/apujar/bible/:bible_page", param("bible_page").isInt())

		.get((req, res) =>
		{
			const params = req.params;
			const valid = validateParameter(req, "bible_page", "number", res);

			if (!valid)
			{
				return;
			}

			const biblePage = Number(params.bible_page);
            const api = getAPI(req, res);

			responses.getBibleEntry(res, api, biblePage);
		})

		.delete((req, res) =>
		{
			const params = req.params;
			const valid = validateParameter(req, "bible_page", "number", res);

			if (!valid)
			{
				return;
			}

			const biblePage = Number(params.bible_page);
            const api = getAPI(req, res);

			responses.deleteBibleEntry(res, api, biblePage);
		})

		.patch((req, res) =>
		{
			const params = req.params;
			const body = req.body;

			let valid = validateParameter(req, "bible_page", "number", res);

			if (!valid)
			{
				return;
			}

			const biblePage = Number(params.bible_page);

			valid = validate(body, patchSchema, res);
	
			if (!valid)
			{
				return;
			}

			const entry = body.entry;
            const api = getAPI(req, res);

			responses.patchBibleEntry(res, api, biblePage, entry);
		});
}

/*
 * Export modules
 */

module.exports.setup = setup;