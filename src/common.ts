export * as gitignore from "https://esm.sh/gitignore-parser@0.0.2"
export * as fennec from "https://oliver-makes-code.github.io/FennecConfig/impl/typescript/mod.ts"
import fennec from "https://oliver-makes-code.github.io/FennecConfig/impl/typescript/mod.ts"
import { BuiltinPlugin, Plugin, PluginType, TypedPlugin } from "./plugin.ts"
import * as fs from "https://deno.land/std@0.167.0/fs/mod.ts";

import BlockstatePlugin from "./plugins/blockstate.ts"
import McMetaPlugin from "./plugins/mcmeta.ts"

const builtinPlugins: (Plugin & BuiltinPlugin)[] = [
    BlockstatePlugin, McMetaPlugin
]

const NOT_RELATIVE = /^([A-Z]+:)?[\/\\]/i

export const LOADED_PLUGINS = await loadPlugins()

interface Array<T> {
    contains(obj: any): boolean;
}

function isUrl(path: string): boolean {
    try {
        let url = new URL(path)

        return ["http", "https"].indexOf(url.protocol) != -1
    } catch {
        return false
    }
}

async function loadPlugins(): Promise<Plugin[]> {
    const meta = await getMeta()
    if (!meta) return builtinPlugins
    if (!meta.plugins) return builtinPlugins
    let out = [...builtinPlugins]

    for (let plugin of meta.plugins) {
        if (isUrl(plugin)) {
            out.push((await import(plugin)).default)
        } else if (plugin.match(NOT_RELATIVE)) {
            out.push((await import(plugin)).default)
        } else {
            out.push((await import(Deno.cwd()+"/"+plugin)).default)
        }
    }

    return out
}

export function getPlugins<T1 extends TypedPlugin<T2>, T2 extends PluginType>(type: T2): T1[] {
    let plugins: T1[] = []
    for (let plugin of LOADED_PLUGINS)
        if (plugin.type == type)
            plugins.push(plugin as T1)
        else if (plugin.type == PluginType.BUILTIN && plugin.plugin.type == type)
            plugins.push(plugin.plugin as T1)
    return plugins
}

export const PackType = {
    data: "data",
    resource: "resource",
    both: "both"
} as const
export type PackType = typeof PackType[keyof typeof PackType]

export const SCHEMA_VERSION = "1.1.0"

export interface PackGenMeta {
    schema: `${number}.${number}.${number}`
    name: string
    description: string
    namespace: string
    version: string
    license: string
    type: PackType
    repo?: string,
    plugins?: string[]
}

export type OrArray<T> = T | T[]

// TODO: parse /license(.(txt|md))?/ to get license type
export function getLicense(): string {
    return "ARR"
}

const SSH_REPO_REGEX = /^.*@([^:]+):(.+?)(\.git)?$/
const HTTP_REPO_REGEX = /^(https?:\/\/[^\/]+\/(.+?))(\.git)?$/

export async function getRepo(): Promise<void|string> {
    const run = Deno.run({ cmd: [ "git", "config", "--get", "remote.origin.url" ], stdout: "piped" })
    const repo =  new TextDecoder().decode(await run.output()).trim()
    const ssh = repo.match(SSH_REPO_REGEX)
    if (ssh) {
        return "https://"+ssh[1]+"/"+ssh[2]
    }
    const http = repo.match(HTTP_REPO_REGEX)
    if (http) {
        return http[1]
    }

    return
}

export async function getMeta(): Promise<void|PackGenMeta> {
    try {
        return fennec.parse(await Deno.readTextFile("pack.fennec")) as PackGenMeta
    } catch {/*Ignored*/}
}

export const IDENTIFIER = /^([a-z0-9_\-\.]+):([a-z0-9_\-\.\/]+)$/
export const LEGAL_NAMESPACE = /^[a-z0-9_\-\.]+$/
export const LEGAL_PATH = /^[a-z0-9_\-\.\/]+$/

export const PACK_FORMAT = 14

type Identifier = string

export function validateIdentifier(identifier: Identifier): boolean {
    return !!identifier.match(/([a-z\.\-_]+:)?[a-z\.\-_/]+/)
}
