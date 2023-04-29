import * as common from "./common.ts"
import { ColorCodes } from "./common.ts"
import term from "./term.tsx"

const GPL_REGEX = /^a?gpl$/i
const VALID_TYPE_REGEX = /^(resource|data|both)$/i
const ILLEGAL_NAMESPACE = /[^a-z0-9_\-\.]/g

export default async function init(name?: string, description?: string) {
    const oldMeta = await common.getMeta()
    if (oldMeta) {
        const res = prompt(term.init.prompt.update)?.toLowerCase() == "y"
        if (!res) return
        name = oldMeta.name
        description = oldMeta.description
        console.log()
    }
    const meta = (await getMeta(name, description, oldMeta?.type, oldMeta?.license))!
    console.log()
    Deno.writeTextFile("pack.fennec", common.fennec.stringify(meta, false))
    console.log((oldMeta ? term.init.updated : term.init.created)("pack.fennec"))
    if (meta.type == common.PackType.data || meta.type == common.PackType.both) {
        try {
            await Deno.mkdir("data")
            console.log(term.init.created("data directory"))
        } catch {/*Ignored, dir already exists*/}
    }
    if (meta.type == common.PackType.resource || meta.type == common.PackType.both) {
        try {
            await Deno.mkdir("assets")
            console.log(term.init.created("assets directory"))
        } catch {/*Ignored, dir already exists*/}
    }
}

async function getMeta(name?: string, description?: string, type?: string, license?: string): Promise<void|common.PackGenMeta> {
    let res = false
    const initialName = name ?? "My cool pack!"
    const initialDesc = description
    const initialType = type ?? common.PackType.resource
    const initialLicense = license ?? "ARR"
    while (!res) {
        name = prompt(term.init.prompt.name, initialName)!
        description = prompt(term.init.prompt.desc, initialDesc ?? name)!
        let namespace = prompt(term.init.prompt.ns, name.toLowerCase().replaceAll(ILLEGAL_NAMESPACE, "_"))!
        while (!namespace?.match(common.LEGAL_NAMESPACE)) {
            console.log(term.init.err.ns(namespace))
            namespace = prompt(term.init.prompt.ns, name.toLowerCase().replaceAll(ILLEGAL_NAMESPACE, "_"))!
        }
        const version = prompt(term.init.prompt.ver, "1.0.0")!
        type = prompt(term.init.prompt.type, initialType)!
        while (!type.match(VALID_TYPE_REGEX)) {
            console.log(term.init.err.type(type))
            type = prompt(term.init.prompt.type, common.PackType.resource)!
        }
        let license = prompt(term.init.prompt.license, initialLicense)!
        while (license.match(GPL_REGEX) && license != initialLicense) {
            console.log(term.init.err.license)
            const res = prompt(term.init.prompt.continue)?.toLowerCase() == "y"
            if (res) break
            license = prompt(term.init.prompt.license, common.getLicense())!
        }
        const repo = prompt(term.init.prompt.repo, await common.getRepo()) ?? undefined
        const meta: common.PackGenMeta = {
            schema: "1.0.0",
            name,
            description,
            namespace,
            version,
            type: type.toLowerCase() as common.PackType,
            license,
            repo,
        }
        console.log(term.init.fennec(meta))
        res = prompt(term.init.prompt.continue)?.toLowerCase() == "y"
        if (res) return meta
        console.log()
    }
}
