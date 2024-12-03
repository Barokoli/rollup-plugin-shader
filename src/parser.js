export function parse(fullText) {
    fullText = fullText.split(";").map((p) => p.startsWith("\n") ? p : "\n" + p).join(";")
    let defines = fullText.split("\n").filter((l => l.startsWith("#"))).join("\n")
    // console.log(`Defines:\n${defines}`)
    fullText = fullText.split("\n").filter((l => !l.startsWith("#"))).join("\n")
    // console.log(`Fulltext:\n${fullText}`)


    const rt = fullText.split("").reverse().join("");
    const curlMap = recursiveHierarchy(fullText, rt, /\{/gm, /\}/gm)
    const topLevel = getTopLevel(fullText, rt, curlMap)
    const variables = extractVars(topLevel)
    // console.log(`Top level: \n${topLevel}\n_____________________`)
    // console.log(`Variables:`)
    // console.log(variables)
    const baseFuncs = getMainFunctions(fullText)

    const result = {}
    for (const [name, obj] of Object.entries(baseFuncs)) {
        // console.log(`Func ${name}, params: ${obj.params}.`)
        if (!obj.params) {
            let r = defines

            const funcs = {}

            for (const [fname, fobj] of Object.entries(baseFuncs)) {
                funcs[fname] = {
                    name: fname,
                    body: getFunction(fullText, fobj.idx, curlMap, fname === name ? [name, "main"] : undefined),
                    deps: [],
                    added: false
                }
            }

            for (const [fname, fobj] of Object.entries(funcs)) {
                for (const [other, oobj] of Object.entries(funcs)) {
                    if (other !== fname && funcs[fname].body.includes(other)) {
                        funcs[fname].deps.push(funcs[other])
                    }
                }
            }

            // for (const [fname, fobj] of Object.entries(funcs)) {
            //     console.log(`${fname} deps -> [${funcs[fname].deps.map((e) => e.name).join(',')}]`)
            // }

            function addDeps(name, res) {
                // console.log(funcs[name].deps)
                if(funcs[name].added) {
                    return
                }
                if (funcs[name].deps.length === 0 && !funcs[name].added) {
                    res.value += funcs[name].body
                    funcs[name].added = true
                } else {
                    for (const dep of funcs[name].deps) {
                        addDeps(dep.name, res)
                    }
                    res.value += "\n" + funcs[name].body
                    funcs[name].added = true
                }
            }

            const res = {value: ""}
            addDeps(name, res, "main")

            for (const v of variables) {
                if (res.value.includes(v.name)) {
                    r += "\n" + v.full
                }
            }

            result[name] = r + "\n" + res.value
        }
    }
    return result
}

function getFunction(ft, idx, curlMap, replace=undefined) {
    const start = ft.slice(idx).indexOf("{")
    if (replace) {
        let dec = ft.slice(Math.max(idx, 0), idx + start)
        let body = ft.slice(idx + start, Math.min(curlMap[start + idx], ft.length))
        return (dec.replace(replace[0], replace[1]) + body).trim()
    }
    return ft.slice(Math.max(idx, 0), Math.min(curlMap[start + idx], ft.length)).trim()
}

function extractVars(ft) {
    const re = /^\s*(\w+)\s+(\w[\w\d_]*)\s+(\w[\w\d_]*);/gm
    let m;

    const vars = [];
    const parsed = new Set();

    while ((m = re.exec(ft)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }

        if (!parsed.has(m[3])) {
            parsed.add(m[3])
        } else {
            continue
        }
        vars.push({
            "packing": m[1],
            "type": m[2],
            "name": m[3],
            "full": m[0]
        })
    }
    return vars
}

function getTopLevel(ft, rt, curlMap) {
    let res = ""
    let marker = 0
    const sortedCurls = Object.entries(curlMap).sort((a, b) => a > b)
    const stop = /[;}]/gm
    const funcs = sortedCurls.map((([start, end]) => {
        stop.lastIndex = ft.length - start
        const m = stop.exec(rt)
        if (m == null) {
            // console.error(`Failed to parse start of func at:\n${ft.slice(Math.max(start - 40, 0), Math.min(start + 100, ft.length))}`)
            return [start, end]
        }
        return [ft.length - m.index, end]
    }))
    for(const [start, end] of funcs) {
        if (marker < start) {
            res += ft.slice(marker, start)
        }
        marker = Math.max(end, marker)
    }
    if (marker < ft.length) {
        res += ft.slice(marker, ft.length)
    }
    return res
}

function getMainFunctions(fullText) {
    const regex = /^\s*[\w\d]+\s+([\w_]+)\(([^\)]*)\)\s*\{/gm;
    let m;

    const results = {}

    while ((m = regex.exec(fullText)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        results[m[1]] = {
            "name": m[1],
            "params": m[2],
            "idx": m.index
        }
    }
    return results
}

function recursiveHierarchy(fullText, rt, open, close) {

    const matched = new Set()
    const len = fullText.length
    let m, m2

    const pairs = {}
    while ((m = open.exec(rt)) !== null) {
        if (m.index === open.lastIndex) {
            open.lastIndex++;
        }

        const start = len - m.index;
        let end;
        close.lastIndex = start;

        // console.log(`Searching from :\n${fullText.slice(start - 1, start + 100 - 1)}`)

        while ((m2 = close.exec(fullText)) != null) {
            close.lastIndex++;
            if (!matched.has(m2.index)) {
                matched.add(m2.index);
                end = m2.index;
                break;
            }
        }
        // console.log(`Pair: ${start} - ${end}, (${end-start})`)
        pairs[start - 1] = end + 1
    }

    return pairs
}
