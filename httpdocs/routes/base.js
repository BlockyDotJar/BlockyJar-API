async function setup(app)
{
	app.get("/v1", (_, res) =>
	{
		return res.status(200).jsonp
		(
			{
				"status": 200,
				"message": "Hello World!",
				"version": "v1",
				"base_url": "https://api.blockyjar.dev/v1",
				"docs_url": "https://api.blockyjar.dev/v1/docs/"
			}
		);
	});
}

/*
 * Export modules
 */

module.exports.setup = setup;