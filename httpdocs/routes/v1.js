module.exports.setup = (app) => {
	app.get("/v1", (req, res) => {
	  res.jsonp
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