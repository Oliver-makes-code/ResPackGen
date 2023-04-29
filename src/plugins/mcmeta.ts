import { BuiltinPlugin, Plugin } from "../plugin.ts";
import * as common from "../common.ts"

const REGEX = /\.mcmeta\.fennec$/i;

export default {
    name: "mcmeta",
    type: "BUILTIN",
    plugin: {
        type: "BUILD_FILE",
        match_filename(filename: string): boolean {
            return !!filename.match(REGEX)
        },
        patch_filename(filename: string): string {
            return filename.replace(REGEX, ".json")
        },
        transform_file(file: string): string {
            return JSON.stringify(common.fennec.parse(file))
        }
    }
} as Plugin & BuiltinPlugin