import * as common from "./common.ts"
import * as fs from "https://deno.land/std@0.167.0/fs/mod.ts";
import { JSZip } from "https://deno.land/x/jszip/mod.ts";

export default async function build() {

    const meta = await common.getMeta()

    if (!meta) {
        console.log(common.ColorCodes.RED + "This directory doesn't contain a pack." + common.ColorCodes.RESET)
        console.log(common.ColorCodes.RED + "Run the " + common.ColorCodes.BLUE + "init" + common.ColorCodes.RESET + common.ColorCodes.RED + " command to initialize a pack" + common.ColorCodes.RESET)
        return
    }

    const zipname = meta.name.replaceAll(" ","-").replaceAll("/","-")+"-"+meta.version+".zip"

    const zip = new JSZip()

    if (meta.type == common.PackType.resource || meta.type == common.PackType.both) await transferFiles("./resources", zip)
    if (meta.type == common.PackType.data || meta.type == common.PackType.both) await transferFiles("./data", zip)

    console.log(common.ColorCodes.GREEN+common.ColorCodes.BOLD+"Creating "+common.ColorCodes.RESET+common.ColorCodes.BLUE+"pack.mcmeta")
    zip.addFile("pack.mcmeta", JSON.stringify({pack:{description:meta.description,pack_format:common.PACK_FORMAT}}))

    zip.writeZip("./"+zipname)

    console.log(common.ColorCodes.GREEN+common.ColorCodes.BOLD+"\nExported "+common.ColorCodes.RESET+common.ColorCodes.BLUE+zipname)
}
const FENNEC_FILE = /\.fennec$/i
const decoder = new TextDecoder()
async function transferFiles(from: string, to: JSZip) {
    try {
        const files = fs.walk(from)
        for await (const entry of files) {
            if (entry.isFile) {
                const content = await Deno.readFile(entry.path)
                if (entry.path.toLowerCase().endsWith(".mcmeta.fennec")) {
                    const path = entry.path.replace(FENNEC_FILE, "")
                    console.log(common.ColorCodes.GREEN+common.ColorCodes.BOLD+"Compiling "+common.ColorCodes.RESET+common.ColorCodes.BLUE+entry.path+common.ColorCodes.GREEN+" -> "+common.ColorCodes.BLUE+path)
                    to.addFile(path, JSON.stringify(common.fennec.parse(decoder.decode(content))))
                } else if (entry.path.toLowerCase().endsWith(".fennec")) {
                    const path = entry.path.replace(FENNEC_FILE, ".json")
                    console.log(common.ColorCodes.GREEN+common.ColorCodes.BOLD+"Compiling "+common.ColorCodes.RESET+common.ColorCodes.BLUE+entry.path+common.ColorCodes.GREEN+" -> "+common.ColorCodes.BLUE+path)
                    to.addFile(path, JSON.stringify(common.fennec.parse(decoder.decode(content))))
                } else {
                    console.log(common.ColorCodes.GREEN+common.ColorCodes.BOLD+"Adding "+common.ColorCodes.RESET+common.ColorCodes.BLUE+entry.path)
                    to.addFile(entry.path, content)
                }
            }
        }
    } catch {/*Ignored*/}
}