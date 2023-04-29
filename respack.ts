// deno-lint-ignore-file require-await
import init from "./src/init.ts"
import build from "./src/build.ts"
import { CLI, literal, named, optional, Builtin } from "https://oliver-makes-code.github.io/ts-cli/mod.tsx"
import * as common from "./src/common.ts"

const cli = new CLI("ResPackGen", "A Minecraft resource pack creation tool.")

cli.register(
    {
        args: [literal("build")],
        call() {
            build().then(() => {})
        },
        description: "Builds a pack"
    },
    {
        args: [literal("init"), named(optional(Builtin.STRING), "name"), named(optional(Builtin.STRING), "description")],
        call(name?: string, description?: string) {
            init(name, description).then(() => {})
        },
        description: "Creates a pack"
    },
    {
        args: [literal("help")],
        call() {
            cli.printHelp()
        },
        description: "Show help"
    }
)

const plugins = common.getPlugins("SUB_COMMAND")

for (let plugin of plugins) {
    cli.register(plugin.command)
}

if (import.meta.main)
    cli.execute()
