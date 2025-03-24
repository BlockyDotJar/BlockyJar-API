const replacements = require("../resources/replacements.json");
const { REGEX_GENERATOR_SUCCESS, REGEX_GENERATOR_MISSING_PATTERN } = require("../utils/responses");

/*
 * POST /v2/regex
 */

async function generate(res, pattern, exactMatch, equalChars, whitespaceLimit, matchRegExChars)
{
    if (pattern.length === 1 && !pattern[0].trim())
    {
        return res.status(400).jsonp(REGEX_GENERATOR_MISSING_PATTERN);
    }

    const cleanedPattern = pattern.filter(pat => pat && pat.trim());
    const regEx = cleanedPattern.join("|");

    let newRegEx = regEx;

    if (equalChars)
    {
        newRegEx = "";

        for (const char of regEx)
        {
            if (replacements[char])
            {
                newRegEx += `[${replacements[char]}][\\W_]*?`;
                continue;
            }

            if (matchRegExChars && char.match(/[|()?+\[\]\\]+/))
            {
                newRegEx += `${char}`;
                continue;
            }

            if (!whitespaceLimit && char === ' ')
            {
                newRegEx += "[^\\s]+";
                continue;
            }

            newRegEx += `[${char}][\\W_]*?`;
        }
    }

    if (!whitespaceLimit)
    {
        newRegEx = newRegEx.replace(/\s+/g, "[^\\s]+");
    }

    let finalRegEx = `\\b(${newRegEx})\\b`;

    if (exactMatch)
    {
        finalRegEx = `^(${newRegEx})$`;
    }

    const specialCharacters = cleanedPattern.some(pat =>
    {
        return !pat.match(/^\w+$/);
    });

    if (!exactMatch && specialCharacters)
    {
        finalRegEx = `(?:^|\\W)(${newRegEx})(?:\\W|$)`;
    }

    const response = REGEX_GENERATOR_SUCCESS(finalRegEx);

    return res.status(200).jsonp(response);
}

/*
 * Export modules
 */

module.exports.generate = generate;