const { validationResult } = require("express-validator");
const { Validator } = require("jsonschema");

const validate = (body, schema, res) =>
{
    const validator = new Validator();
    const valResult = validator.validate(body, schema);

    if (!valResult.valid)
    {
        const errors = valResult.errors.map(error =>
        {
            const property = error.property;
            const message = error.message;

            return `${property} ${message}.`;
        });

        res.status(400).jsonp
        (
            {
                "status": 400,
                "errors": errors
            }
        );

        return false;
    }

    return true;
};

const validateParameter = (req, paramID, paramType, res) =>
{
    const valResult = validationResult(req);

    if (!valResult.isEmpty())
    {
        res.status(400).jsonp
        (
            {
                "status": 400,
                "errors": [ `param.${paramID} is not of a type(s) ${paramType}.` ]
            }
        );

        return false;
    }

    return true;
};

const validateParameters = (req, res) =>
{
    const valResult = validationResult(req);

    if (!valResult.isEmpty())
    {
        const errors = valResult.array().map(error =>
        {
            const path = error.path;
            const type = path === "limit" ? "number" : "boolean";

            return `query.${path} is not of a type(s) ${type}.`
        });

        res.status(400).jsonp
        (
            {
                "status": 400,
                "errors": errors
            }
        );

        return false;
    }

    return true;
};

/*
 * Export modules
 */

module.exports =
{
    validate: validate,
    validateParameter: validateParameter,
    validateParameters: validateParameters
};