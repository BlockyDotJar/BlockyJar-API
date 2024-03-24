/* eslint-disable no-useless-escape */

async function generate(res, pattern, exactMatch, equalChars, whitespaceLimit) {
    const regEx = pattern.join("|");

    const replacements = {
        "a": "aä@4%⁴",
        "ä": "aä@4%⁴",
        "@": "aä@4%⁴",
        "%": "aä@4%⁴",
        "e": "e€3³",
        "€": "e€3³",
        "g": "g9⁹",
        "i": "i71!¹⁷",
        "!": "i71!¹⁷",
        "o": "oö0⁰",
        "ö": "oö0⁰",
        "s": "s$ß",
        "$": "s$ß",
        "ß": "s$ß",
        "u": "uü",
        "ü": "uü",
        "0": "oö0⁰",
        "1": "i71!¹⁷",
        "2": "2²",
        "3": "e€3³",
        "4": "aä@4%⁴",
        "5": "5⁵",
        "6": "6⁶",
        "7": "i71!¹⁷",
        "8": "8⁸",
        "9": "g9⁹",
        "⁰": "oö0⁰",
        "¹": "i71!¹⁷",
        "²": "2²",
        "³": "e€3³",
        "⁴": "aä@4%⁴",
        "⁵": "5⁵",
        "⁶": "6⁶",
        "⁷": "i71!¹⁷",
        "⁸": "8⁸",
        "⁹": "g9⁹",
    };

    let newRegEx = regEx;

    if (equalChars) {
        newRegEx = "";

        for (const char of regEx) {
            if (replacements[char]) {
                newRegEx += `[${replacements[char]}][\\W_]*?`;
                continue;
            }

            if (char.match(/[\(\)\?+\[\]\|\\]+/)) {
                newRegEx += `${char}`;
                continue;
            }

            newRegEx += `[${char}][\\W_]*?`;
        }
    }

    if (!whitespaceLimit) {
        newRegEx = newRegEx.replace(/ /g, "^\\s");
    }

    let finalRegEx = `\\b(${newRegEx})\\b`;

    if (exactMatch) {
        finalRegEx = `^(${newRegEx})$`;
    }

    res.status(200).jsonp({
        "status": 200,
        "regex": finalRegEx
    });
}

module.exports.generate = generate;