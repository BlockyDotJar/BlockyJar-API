const { getAPI } = require("../utils/twitch-utils");
const { getOwner, getOwners, postOwner, deleteOwner, patchOwner } = require("../utils/express-utils");

module.exports.setup = (app) => {
	app.route("/v1/owners")
		.get((req, res) => {
			const api = getAPI(req, res);

			getOwners(res, api);
		})
		.post((req, res) => {
			const id = Number(req.body.id);
			const login = req.body.login;

			if (!id || !login) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Request body object 'id' and/or 'login' is/are missing. (application/json)"
				});
		
				return;
			}

			if (isNaN(id)) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Invalid 'id' object specified. The specified value isn't a valid integer."
				});

				return;
			}

			const api = getAPI(req, res);

			postOwner(res, api, id, login);
		});

	app.route("/v1/owners/:owner_id")
		.get((req, res) => {
			const ownerID = Number(req.params.owner_id);

			if (isNaN(ownerID)) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Invalid 'owner_id' parameter specified. The specified value isn't a valid integer."
				});

				return;
			}

			const api = getAPI(req, res);

			getOwner(res, api, ownerID);
		})
		.delete((req, res) => {
			const ownerID = Number(req.params.owner_id);

			if (isNaN(ownerID)) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Invalid 'owner_id' parameter specified. The specified value isn't a valid integer."
				});

				return;
			}

			const api = getAPI(req, res);

			deleteOwner(res, api, ownerID);
		})
		.patch((req, res) => {
			const ownerID = Number(req.params.owner_id);

			if (isNaN(ownerID)) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Invalid 'owner_id' parameter specified. The specified value isn't a valid integer."
				});

				return;
			}

			const login = req.body.login;

			if (!login) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Request body object 'login' is missing. (application/json)"
				});
		
				return;
			}

			const api = getAPI(req, res);

			patchOwner(res, api, ownerID, login);
		});
};