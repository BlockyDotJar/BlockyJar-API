const { getAPI } = require("../../../../utils/twitch");
const { param, validationResult } = require("express-validator");
const { Validator } = require("jsonschema");

const responses = require("../../../../utils/responses/user");

const schema = require("../../../../resources/schema/PATCH-user.json");

module.exports.setup = (app) => {
	app.patch("/v1/apujar/internal/user/:user_id", param("user_id").isInt(), (req, res) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).jsonp
            (
                {
                    "status": 400,
                    "errors": [ "param.user_id is not of a type(s) number." ]
                }
            );
        }

        const userID = Number(req.params.user_id);

        const validator = new Validator();
        const valResult = validator.validate(req.body, schema);

        if (!valResult.valid) {
            const errors = valResult.errors.map(error => `${error.property} ${error.message}.`);

            return res.status(400).jsonp
            (
                {
                    "status": 400,
                    "errors": errors
                }
            );
        }

        const userLogin = req.body.user_login;

        const api = getAPI(req, res);

        responses.patchUser(res, api, userID, userLogin);
    });
};