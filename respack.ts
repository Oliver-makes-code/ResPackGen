// deno-lint-ignore-file require-await
import init from "./src/init.ts"
import build from "./src/build.ts"
import { ColorCodes } from "./src/common.ts"

const commands = {
    help: {
        desc: "Displays help",
        async call() {
            for (const c in commands) {
                const command = commands[c]
                let args = ""
                if (command.args) {
                    for (const i of command.args) {
                        args += ColorCodes.BLUE + "[" + ColorCodes.CYAN + i.name + (i.optional ? ColorCodes.RED + "?" : "") + ColorCodes.BLUE + "] "
                    }
                }
                console.log(`    ${ColorCodes.BLUE+c} ${args+ColorCodes.RESET}- ${command.desc}`)
            }
        }
    },
    init: {
        desc: "Creates a pack",
        args: [
            {
                name: "name",
                optional: true
            },
            {
                name: "description",
                optional: true
            }
        ],
        async call(_, name?: string, description?: string) {
            init(name, description)
        }
    },
    build: {
        desc: "Builds a pack",
        async call() {
            await build()
        }
    }
} as {[name: string]: {
    desc: string,
    args?: {
        name: string,
        optional: boolean
    }[]
    call(...args: string[]): Promise<void>
}}

if (import.meta.main) {
    if (!Deno.args[0]) {
        await commands.help.call()
        Deno.exit()
    }
    const command = commands[Deno.args[0]]
    if (command) await command.call(...Deno.args)
    else {
        console.log(ColorCodes.RED+"Unknown command: "+ColorCodes.BLUE+Deno.args[0]+ColorCodes.RESET+"\n")
        await commands.help.call()
    }
}