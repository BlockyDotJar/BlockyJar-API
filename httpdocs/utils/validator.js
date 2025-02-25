const { validationResult } = require("express-validator");
const { Validator } = require("jsonschema");

const {

    VALIDATOR_ERRORS_BAD_REQUEST,
    VALIDATOR_TYPE_SAFETY_ERRORS_BAD_REQUEST,
    VALIDATOR_MULTIPLE_TYPE_SAFETY_ERRORS_BAD_REQUEST

} = require("../utils/responses");

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

        const response = VALIDATOR_ERRORS_BAD_REQUEST(errors);
        res.status(400).jsonp(response);

        return false;
    }

    return true;
};

const validateParameter = (req, paramID, paramType, res) =>
{
    const valResult = validationResult(req);

    if (!valResult.isEmpty())
    {
        const response = VALIDATOR_TYPE_SAFETY_ERRORS_BAD_REQUEST(paramID, paramType);
        res.status(400).jsonp(response);

        return false;
    }

    return true;
};

const validateMultipleParameter = (req, res) =>
{
    const valResult = validationResult(req);

    if (!valResult.isEmpty())
    {
        const paths = valResult.array().map(error => `param.${error.path} is not of needed type(s).`);
        const response = VALIDATOR_MULTIPLE_TYPE_SAFETY_ERRORS_BAD_REQUEST(paths);
        res.status(400).jsonp(response);

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
    validateMultipleParameter: validateMultipleParameter
};