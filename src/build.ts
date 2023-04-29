import * as common from "./common.ts"
import * as fs from "https://deno.land/std@0.167.0/fs/mod.ts";
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";
import { transformBlockState } from "./blockstate.ts";
import term from "./term.tsx"

export default async function build() {

    const meta = await common.getMeta()

    if (!meta) {
        console.log(term.build.err.no_meta)
        return
    }

    const zipname = meta.name.replaceAll(" ","-").replaceAll("/","-").replaceAll("\\","-").replaceAll(":","-")+"-"+meta.version+".zip"

    const zip = new JSZip()

    if (meta.type == common.PackType.resource || meta.type == common.PackType.both) await transferFiles("./assets", zip)
    if (meta.type == common.PackType.data || meta.type == common.PackType.both) await transferFiles("./data", zip)

    console.log(term.build.creating("pack.mcmeta"))
    zip.addFile("pack.mcmeta", JSON.stringify({pack:{description:meta.description,pack_format:common.PACK_FORMAT}}))

    zip.writeZip("./"+zipname)

    console.log(term.build.exported(zipname))
}
const FENNEC_FILE = /\.fennec$/i
const MCMETA_FILE = /\.mcmeta\.fennec$/i
const BLOCKSTATE_FILE = /\.blockstate\.fennec$/i
const decoder = new TextDecoder()
async function transferFiles(from: string, to: JSZip) {
    try {
        const files = fs.walk(from)
        for await (const entry of files) {
            if (entry.isFile) {
                const content = await Deno.readFile(entry.path)
                if (entry.path.match(MCMETA_FILE)) {
                    const path = entry.path.replace(FENNEC_FILE, "")
                    console.log(term.build.compiling(entry.path, path))
                    to.addFile(path, JSON.stringify(common.fennec.parse(decoder.decode(content))))
                } else if (entry.path.match(BLOCKSTATE_FILE)) {
                    const path = entry.path.replace(BLOCKSTATE_FILE, ".json")
                    console.log(term.build.compiling(entry.path, path))
                    to.addFile(path, JSON.stringify(transformBlockState(common.fennec.parse(decoder.decode(content)))))
                } else if (entry.path.match(FENNEC_FILE)) {
                    const path = entry.path.replace(FENNEC_FILE, ".json")
                    console.log(term.build.compiling(entry.path, path))
                    to.addFile(path, JSON.stringify(common.fennec.parse(decoder.decode(content))))
                } else {
                    console.log(term.build.adding(entry.path))
                    to.addFile(entry.path, content)
                }
            }
        }
    } catch (err) {console.error(err)}
}