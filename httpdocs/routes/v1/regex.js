const { generate } = require("../../utils/regex-generator");

module.exports.setup = (app) => {
    app.post("/v1/regex", (req, res) => {
        const pattern = req.body.pattern;
        const exactMatch = req.body.exact_match;
        const equalChars = req.body.equal_chars;
        const whitespaceLimit = req.body.whitespace_limit;

        if (!pattern) {
            res.status(400).jsonp({
                "status": 400,
                "message": "Request body object 'pattern' is missing or empty. (application/json)"
            });

            return;
        }

        if (!Array.isArray(pattern)) {
            res.status(400).jsonp({
                "status": 400,
                "message": "Request body object 'pattern' should be an array."
            });

            return;
        }

        if (exactMatch === undefined) {
            res.status(400).jsonp({
                "status": 400,
                "message": "Request body object 'exact_match' is missing. (application/json)"
            });

            return;
        }

        if (typeof exactMatch !== "boolean") {
            res.status(400).jsonp({
                "status": 400,
                "message": "Invalid 'exact_match' parameter specified. The specified value isn't a valid boolean."
            });

            return;
        }

        if (equalChars === undefined) {
            res.status(400).jsonp({
                "status": 400,
                "message": "Request body object 'equal_chars' is missing. (application/json)"
            });

            return;
        }

        if (typeof equalChars !== "boolean") {
            res.status(400).jsonp({
                "status": 400,
                "message": "Invalid 'equal_char' parameter specified. The specified value isn't a valid boolean."
            });

            return;
        }

        if (whitespaceLimit === undefined) {
            res.status(400).jsonp({
                "status": 400,
                "message": "Request body object 'whitespace_limit' is missing. (application/json)"
            });

            return;
        }

        if (typeof whitespaceLimit !== "boolean") {
            res.status(400).jsonp({
                "status": 400,
                "message": "Invalid 'whitespace_limit' parameter specified. The specified value isn't a valid boolean."
            });

            return;
        }

        generate(res, pattern, exactMatch, equalChars, whitespaceLimit);
    });
};