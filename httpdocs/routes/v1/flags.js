const { checkFlags } = require("../../utils/responses/flags");
const { Validator } = require("jsonschema");

const schema = require("../../resources/schema/POST-flags.json");

module.exports.setup = (app) => {
    app.post("/v1/flags", (req, res) => {
        const validator = new Validator();
        const validationResult = validator.validate(req.body, schema);

        if (!validationResult.valid) {
            const errors = validationResult.errors.map(error => `${error.property} ${error.message}.`);

            return res.status(400).jsonp
            (
                {
                    "status": 400,
                    "errors": errors
                }
            );
        }

        const flags = Number(req.body.flags);
        const flagItems = req.body.flag_items;

        checkFlags(res, flags, flagItems);
    });
};