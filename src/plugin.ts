import { Argument } from "https://oliver-makes-code.github.io/ts-cli/mod.tsx"

export const PluginType = {
    BUILD_FILE: "BUILD_FILE",
    SUB_COMMAND: "SUB_COMMAND",
    BUILTIN: "BUILTIN"
} as const

export type PluginType = typeof PluginType[keyof typeof PluginType]

export type BuildFilePlugin = {
    readonly type: typeof PluginType.BUILD_FILE,
    match_filename(filename: string): boolean,
    patch_filename(filename: string): string,
    transform_file(file: string): string
}

export type SubCommandPlugin<T extends any[]> = {
    readonly type: typeof PluginType.SUB_COMMAND,
    readonly command: Argument<T>
}

type CustomPlugin = BuildFilePlugin | SubCommandPlugin<any[]>

export type BuiltinPlugin = {
    readonly type: typeof PluginType.BUILTIN,
    readonly plugin: CustomPlugin
}

export type Plugin = {
    readonly name: string
} & ( CustomPlugin | BuiltinPlugin )

export type TypedPlugin<T extends PluginType> = Plugin & { readonly type: T }
