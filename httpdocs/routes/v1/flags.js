const { checkFlags } = require("../../utils/responses/flags");

const { validate } = require("../../utils/validator");

const schema = require("../../resources/schema/flags/POST.json");

async function setup(app)
{
    app.post("/v1/flags", (req, res) =>
    {
        const body = req.body;
        const valid = validate(body, schema, res);

        if (!valid)
        {
            return;
        }

        const flags = Number(body.flags);
        const flagItems = body.flag_items;

        checkFlags(res, flags, flagItems);
    });
}

/*
 * Export modules
 */

module.exports.setup = setup;