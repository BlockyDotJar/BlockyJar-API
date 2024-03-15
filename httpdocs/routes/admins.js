const { getAPI, getAdmin, getAdmins, postAdmin, deleteAdmin, patchAdmin } = require("../utils/twitch-utils");

module.exports.setup = (app) => {
	app.route("/v1/admins")
		.get((req, res) => {
			const api = getAPI(req, res);

			getAdmins(res, api);
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

			postAdmin(res, api, id, login);
		});

	app.route("/v1/admins/:admin_id")
		.get((req, res) => {
			const adminID = Number(req.params.admin_id);

			if (isNaN(adminID)) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Invalid 'admin_id' parameter specified. The specified value isn't a valid integer."
				});

				return;
			}

			const api = getAPI(req, res);

			getAdmin(res, api, adminID);
		})
		.delete((req, res) => {
			const adminID = Number(req.params.admin_id);

			if (isNaN(adminID)) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Invalid 'admin_id' parameter specified. The specified value isn't a valid integer."
				});

				return;
			}

			const api = getAPI(req, res);

			deleteAdmin(res, api, adminID);
		})
		.patch((req, res) => {
			const adminID = Number(req.params.admin_id);

			if (isNaN(adminID)) {
				res.status(400).jsonp({
					"status": 400,
					"message": "Invalid 'admin_id' parameter specified. The specified value isn't a valid integer."
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

			patchAdmin(res, api, adminID, login);
		});
};