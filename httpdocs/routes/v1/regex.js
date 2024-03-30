const { generate } = require("../../utils/responses/regex");
const { Validator } = require("jsonschema");

const schema = require("../../resources/schema/POST-regex.json");

module.exports.setup = (app) => {
    app.post("/v1/regex", (req, res) => {
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

        const pattern = req.body.pattern;
        const exactMatch = req.body.exact_match;
        const equalChars = req.body.equal_chars;
        const whitespaceLimit = req.body.whitespace_limit;

        generate(res, pattern, exactMatch, equalChars, whitespaceLimit);
    });
};