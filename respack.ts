// deno-lint-ignore-file require-await
import init from "./src/init.ts"
import build from "./src/build.ts"
import * as CLI from "https://oliver-makes-code.github.io/ts-cli/mod.tsx"

const cli = new CLI.CLI("ResPackGen", "A Minecraft resource pack creation tool.")

cli.register(
    {
        args: [CLI.literal("build")],
        call() {
            build().then(() => {})
        },
        description: "Builds a pack"
    },
    {
        args: [CLI.literal("init"), CLI.named(CLI.optional(CLI.Builtin.STRING), "name"), CLI.named(CLI.optional(CLI.Builtin.STRING), "description")],
        call(name?: string, description?: string) {
            init(name, description).then(() => {})
        },
        description: "Creates a pack"
    },
    {
        args: [CLI.literal("help")],
        call() {
            cli.printHelp()
        },
        description: "Show help"
    }
)

if (import.meta.main)
    cli.execute()
