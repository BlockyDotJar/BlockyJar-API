const { BASE_ROUTE_SUCCESS } = require("../utils/responses");

async function setup(app)
{
	app.get("/v2", (_, res) => res.status(200).jsonp(BASE_ROUTE_SUCCESS));
}

/*
 * Export modules
 */

module.exports.setup = setup;