const replacements = require("../../resources/replacements.json");

async function generate(res, pattern, exactMatch, equalChars, whitespaceLimit, matchRegExChars)
{
    const regEx = pattern.join("|");

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

            if (matchRegExChars && char.match(/[|()?+[\]\\]+/))
            {
                newRegEx += `${char}`;
                continue;
            }

            newRegEx += `[${char}][\\W_]*?`;
        }
    }

    if (!whitespaceLimit)
    {
        newRegEx = newRegEx.replace(/ /g, "^\\s");
    }

    let finalRegEx = `\\b(${newRegEx})\\b`;

    if (exactMatch)
    {
        finalRegEx = `^(${newRegEx})$`;
    }

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "regex": finalRegEx
        }
    );
}

/*
 * Export modules
 */

module.exports.generate = generate;