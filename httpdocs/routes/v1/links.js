const { createLink } = require("../../utils/responses/links");

const { validate } = require("../../../utils/validator");

const schema = require("../../resources/schema/links/POST.json");

async function setup(app)
{
    app.post("/v1/links", (req, res) =>
    {
        const body = req.body;
        const valid = validate(body, schema, res);

        if (!valid) 
        {
            return;
        }

        const link = body.link;
        const expiresOn = body.expires_on;

        createLink(res, link, expiresOn);
    });
}

/*
 * Export modules
 */

module.exports.setup = setup;