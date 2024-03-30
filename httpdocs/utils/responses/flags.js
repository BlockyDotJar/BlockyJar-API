async function checkFlags(res, flags, flagItems) {
    const checkedFlags = flagItems.map(flagItem => {
        const flag = Number(flagItem.flag);
        const flagName = flagItem.name;

        const hasFlag = (flags & flag) === flag;

        return {
                    "flag": flag,
                    "name": flagName,
                    "is_present": hasFlag
               };
    });

    return res.status(200).jsonp
    (
        {
            "status": 200,
            "flags": checkedFlags
        }
    );
}

/*
 * Export modules
 */

module.exports.checkFlags = checkFlags;