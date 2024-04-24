const { createLink, getLink, deleteLink, patchLink } = require("../../responses/links");

const { param } = require("express-validator");
const { validate, validateParameter } = require("../../utils/validator");

const postSchema = require("../../resources/schema/links/POST.json");
const patchSchema = require("../../resources/schema/links/PATCH.json");

async function setup(app)
{
    app.post("/v1/links", (req, res) =>
    {
        const body = req.body;
        const valid = validate(body, postSchema, res);

        if (!valid) 
        {
            return;
        }

        const link = body.link;
        const expiresOn = body.expires_on;

        createLink(res, link, expiresOn);
    });

    app.route("/v1/links/:link_uuid", param("link_uuid").isUUID())

        .get((req, res) =>
        {
            const params = req.params;
            const valid = validateParameter(req, "link_uuid", "uuid", res);

            if (!valid) 
            {
                return;
            }

            const linkUUID = params.link_uuid;

            getLink(res, linkUUID);
        })

        .delete((req, res) =>
        {
            const params = req.params;
            const valid = validateParameter(req, "link_uuid", "uuid", res);

            if (!valid) 
            {
                return;
            }

            const linkUUID = params.link_uuid;

            deleteLink(res, linkUUID);
        })

        .patch((req, res) =>
        {
            const params = req.params;
			const body = req.body;

            let valid = validateParameter(req, "link_uuid", "uuid", res);

            if (!valid) 
            {
                return;
            }

            const linkUUID = params.link_uuid;

            valid = validate(body, patchSchema, res);
	
			if (!valid)
			{
				return;
			}

			const link = body.link;
            const expiresOn = body.expires_on;

            patchLink(res, linkUUID, link, expiresOn);
        });
}

/*
 * Export modules
 */

module.exports.setup = setup;