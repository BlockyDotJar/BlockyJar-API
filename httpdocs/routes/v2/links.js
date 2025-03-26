const links = require("../../responses/links");

const { param, query } = require("express-validator");
const validator = require("../../utils/validator");

const deleteSchema = require("../../resources/schema/links/DELETE.json");
const postSchema = require("../../resources/schema/links/POST.json");
const patchSchema = require("../../resources/schema/links/PATCH.json");

const deleteDetailsSchema = require("../../resources/schema/link-details/DELETE.json");

async function setup(app)
{
    app.route("/v2/links")
        .get(query("link_id").isString(), (req, res) =>
        {
            const query = req.query;
            const linkID = query.link_id;

            const valid = validator.validateMultipleParameter(req, res);

            if (!valid)
            {
                return;
            }

            links.getLink(res, linkID, null, false);
        })
    
        .post((req, res) =>
        {
            const body = req.body;
            const valid = validator.validate(body, postSchema, res);

            if (!valid) 
            {
                return;
            }

            const link = body.link;
            const expiresOn = body.expires_on;
            const deleteExpiredDetails = body.delete_expired_details;

            links.createLink(res, link, expiresOn, deleteExpiredDetails);
        });

    app.route("/v2/links/:link_uuid")

        .get([
                param("link_uuid").exists().isUUID(),
                query("additional_information").optional().isBoolean()
             ], (req, res) =>
        {
            const params = req.params;
            const linkUUID = params.link_uuid;

            const query = req.query;
            const additionalInformation = query.additional_information;

            const valid = validator.validateMultipleParameter(req, res);

            if (!valid) 
            {
                return;
            }

            links.getLink(res, null, linkUUID, additionalInformation);
        })

        .delete(param("link_uuid").exists().isUUID(), (req, res) =>
        {
            const params = req.params;
            const body = req.body;

            let valid = validator.validateParameter(req, "link_uuid", "uuid", res);

            if (!valid) 
            {
                return;
            }

            valid = validator.validate(body, deleteSchema, res);
	
			if (!valid)
			{
				return;
			}

            const linkUUID = params.link_uuid;
            const deleteDetails = body.delete_details;
            const additionalInformation = body.additional_information;

            links.deleteLink(res, linkUUID, deleteDetails, additionalInformation);
        })

        .patch(param("link_uuid").exists().isUUID(), (req, res) =>
        {
            const params = req.params;
			const body = req.body;

            let valid = validator.validateParameter(req, "link_uuid", "uuid", res);

            if (!valid) 
            {
                return;
            }

            const linkUUID = params.link_uuid;

            valid = validator.validate(body, patchSchema, res);
	
			if (!valid)
			{
				return;
			}

			const link = body.link;
            const expiresOn = body.expires_on;
            const deleteExpiredDetails = body.delete_expired_details;

            links.patchLink(res, linkUUID, link, expiresOn, deleteExpiredDetails);
        });

        app.delete("/v2/links/details/:link_uuid", param("link_uuid").exists().isUUID(), (req, res) =>
        {
            const params = req.params;
            const body = req.body;

            let valid = validator.validateParameter(req, "link_uuid", "uuid", res);

            if (!valid) 
            {
                return;
            }

            valid = validator.validate(body, deleteDetailsSchema, res);
	
			if (!valid)
			{
				return;
			}

            const linkUUID = params.link_uuid;
            const additionalInformation = body.additional_information;

            links.deleteLinkDetails(res, linkUUID, additionalInformation);
        });
}

/*
 * Export modules
 */

module.exports.setup = setup;