import * as common from "./common.ts"
import { ColorCodes } from "./common.ts"

const GPL_REGEX = /^a?gpl$/i
const VALID_TYPE_REGEX = /^(resource|data|both)$/i
const ILLEGAL_NAMESPACE = /[^a-z0-9_\-\.]/g

export default async function init(name?: string, description?: string) {
    const oldMeta = await common.getMeta()
    if (oldMeta) {
        const res = prompt(ColorCodes.BLUE+"You already have a pack, update?"+ColorCodes.RESET+" [Y/n]")?.toLowerCase() == "y"
        if (!res) return
        name = oldMeta.name
        description = oldMeta.description
        console.log()
    }
    const meta = (await getMeta(name, description, oldMeta?.type, oldMeta?.license))!
    console.log()
    Deno.writeTextFile("pack.fennec", common.fennec.stringify(meta, false))
    console.log(ColorCodes.BOLD+ColorCodes.GREEN+(oldMeta ? "Updated" : "Created" )+ColorCodes.RESET+ColorCodes.BLUE+" pack.fennec")
    if (meta.type == common.PackType.data || meta.type == common.PackType.both) {
        try {
            await Deno.mkdir("data")
            console.log(ColorCodes.BOLD+ColorCodes.GREEN+"Created"+ColorCodes.RESET+ColorCodes.BLUE+" data directory")
        } catch {/*Ignored, dir already exists*/}
    }
    if (meta.type == common.PackType.resource || meta.type == common.PackType.both) {
        try {
            await Deno.mkdir("resources")
            console.log(ColorCodes.BOLD+ColorCodes.GREEN+"Created"+ColorCodes.RESET+ColorCodes.BLUE+" resources directory")
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
        name = prompt(ColorCodes.BLUE+"Pack name"+ColorCodes.RESET, initialName)!
        description = prompt(ColorCodes.BLUE+"Description"+ColorCodes.RESET, initialDesc ?? name)!
        let namespace = prompt(ColorCodes.BLUE+"Namespace"+ColorCodes.RESET, name.toLowerCase().replaceAll(ILLEGAL_NAMESPACE, "_"))!
        while (!namespace?.match(common.LEGAL_NAMESPACE)) {
            console.log(`${ColorCodes.BLUE+namespace+ColorCodes.RED} is not a valid namespace.\nPlease make sure it contains only ${ColorCodes.BLUE+"a-z"+ColorCodes.RED} (case sensitive), ${ColorCodes.BLUE+"0-9"+ColorCodes.RED}, ${ColorCodes.BLUE+"-"+ColorCodes.RED}, ${ColorCodes.BLUE+"_"+ColorCodes.RED}, or ${ColorCodes.BLUE+"."+ColorCodes.RED}.`)
            namespace = prompt(ColorCodes.BLUE+"Namespace"+ColorCodes.RESET, name.toLowerCase().replaceAll(ILLEGAL_NAMESPACE, "_"))!
        }
        const version = prompt(ColorCodes.BLUE+"Version"+ColorCodes.RESET, "1.0.0")!
        type = prompt(ColorCodes.BLUE+"Type"+ColorCodes.RESET, initialType)!
        while (!type.match(VALID_TYPE_REGEX)) {
            console.log(`${ColorCodes.BLUE+type+ColorCodes.RED} is not a valid type.\nPlease select either ${ColorCodes.BLUE+"resource"+ColorCodes.RED}, ${ColorCodes.BLUE+"data"+ColorCodes.RED}, or ${ColorCodes.BLUE+"both"+ColorCodes.RED}`)
            type = prompt(ColorCodes.BLUE+"Type"+ColorCodes.RESET, common.PackType.resource)!
        }
        let license = prompt(ColorCodes.BLUE+"License"+ColorCodes.RESET, initialLicense)!
        while (license.match(GPL_REGEX) && license != initialLicense) {
            console.log(ColorCodes.RED+"The GPL and AGPL licences forbid use with non-free software.\nMinecraft is an example of such.\nLGPL doesn't have this restriction, if you need the GPL"+ColorCodes.RESET)
            const res = prompt(ColorCodes.BLUE+"Do you want to continue?"+ColorCodes.RESET+" [Y/n]")?.toLowerCase() == "y"
            if (res) break
            license = prompt(ColorCodes.BLUE+"License"+ColorCodes.RESET, common.getLicense())!
        }
        const repo = prompt(ColorCodes.BLUE+"Git repo"+ColorCodes.RESET, await common.getRepo()) ?? undefined
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
        console.log("\n"+ColorCodes.MAGENTA + common.fennec.stringify(meta, false) + ColorCodes.RESET)
        res = prompt(ColorCodes.BLUE+"Does this look good?"+ColorCodes.RESET+" [Y/n]")?.toLowerCase() == "y"
        if (res) return meta
        console.log()
    }
}