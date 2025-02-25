const { generate } = require("../../responses/regex");

const { validate } = require("../../utils/validator");

const schema = require("../../resources/schema/regex/POST.json");

async function setup(app)
{
    app.post("/v2/regex", (req, res) =>
    {
        const body = req.body;
        const valid = validate(body, schema, res);

        if (!valid)
        {
            return;
        }

        const pattern = body.pattern;
        const exactMatch = body.exact_match;
        const equalChars = body.equal_chars;
        const whitespaceLimit = body.whitespace_limit;
        const matchRegExChars = body.match_regex_chars;

        generate(res, pattern, exactMatch, equalChars, whitespaceLimit, matchRegExChars);
    });
}

/*
 * Export modules
 */

module.exports.setup = setup;