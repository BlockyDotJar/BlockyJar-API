const { createLink, deleteLink } = require("../../utils/responses/links");

const { param } = require("express-validator");
const { validate, validateParameter } = require("../../utils/validator");

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

    app.delete("/v1/links/:link_uuid", param("link_uuid").isUUID(), (req, res) =>
    {
        const params = req.params;
        const valid = validateParameter(req, "link_uuid", "uuid", res);

        if (!valid) 
        {
            return;
        }

        const linkUUID = params.link_uuid;

        deleteLink(res, linkUUID)
    });
}

/*
 * Export modules
 */

module.exports.setup = setup;