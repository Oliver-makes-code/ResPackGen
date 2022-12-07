export * as gitignore from "https://esm.sh/gitignore-parser@0.0.2"
export * as fennec from "https://oliver-makes-code.github.io/FennecConfig/impl/typescript/mod.ts"
import fennec from "https://oliver-makes-code.github.io/FennecConfig/impl/typescript/mod.ts"

export const PackType = {
    data: "data",
    resource: "resource",
    both: "both"
} as const
export type PackType = typeof PackType[keyof typeof PackType]

export interface PackGenMeta {
    schema: "1.0.0"
    name: string
    description: string
    namespace: string
    version: string
    license: string
    type: PackType
    repo?: string
}

// TODO: parse /license(.(txt|md))?/ to get license type
export function getLicense(): string {
    return "ARR"
}

const SSH_REPO_REGEX = /^.*@([^:]+):(.+?)(\.git)?$/
const HTTP_REPO_REGEX = /^(https?:\/\/[^\/]+\/(.+?))(\.git)?$/

export async function getRepo(): Promise<string|undefined> {
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

function color(code: string|number) {
    return "\u001b["+code+"m"
}

export const ColorCodes = {
    BOLD: color(1),
    RESET: color(0),
    BLACK: color(30),
    RED: color(31),
    GREEN: color(32),
    YELLOW: color(33),
    BLUE: color(34),
    MAGENTA: color(35),
    CYAN: color(36),
    WHITE: color(37),
    DEFAULT: color(39)
}

export async function getMeta(): Promise<void|PackGenMeta> {
    try {
        return fennec.parse(await Deno.readTextFile("pack.fennec")) as PackGenMeta
    } catch {/*Ignored*/}
}

export const LEGAL_NAMESPACE = /^[a-z0-9_\-\.]+$/

export const PACK_FORMAT = 10