import * as React from "https://oliver-makes-code.github.io/ts-cli/fakeReact.tsx"
import { fennec } from "./common.ts"

const { getString } = React

const arrow = "->"

export default {
    init: {
        prompt: {
            update: getString(<><blue>You already have a pack, update?</blue> [Y/n]</>),
            name: getString(<blue>Pack name</blue>),
            desc: getString(<blue>Description</blue>),
            ns: getString(<blue>Namespace</blue>),
            ver: getString(<blue>Version</blue>),
            type: getString(<blue>Type</blue>),
            license: getString(<blue>License</blue>),
            continue: getString(<><blue>Do you want to continue?</blue> [Y/n]</>),
            repo: getString(<blue>Git repo</blue>)
        },
        err: {
            ns(name: any) {
                return getString(<red>
                    <blue>{name}</blue> is not a valid namespace.
                    <br/>
                    Make sure it contains only <blue>a-z</blue> (case sensitive), <blue>0-9</blue>, <blue>-</blue>, <blue>_</blue>, or <blue>.</blue>
                </red>)
            },
            type(name: any) {
                return getString(<red>
                    <blue>{name}</blue> is not a valid type.
                    <br/>
                    Please select only <blue>resource</blue>, <blue>data</blue>, or <blue>both</blue>
                </red>)
            },
            license: getString(<red>
                The GPL and AGPL licenses forbid use with non-free software
                <br/>
                Minecraft is an example of such
                <br/>
                LGPL doesn't have this restriction, if you need to use the GPL
            </red>)
        },
        created(file: any) {
            return getString(<green>
                Created <blue>{file}</blue>
            </green>)
        },
        updated(file: any) {
            return getString(<green>
                Updated <blue>{file}</blue>
            </green>)
        },
        fennec(file: any) {
            return getString(<magenta>
                <br/>
                {fennec.stringify(file, false)}
            </magenta>)
        }
    },
    build: {
        err: {
            no_meta: getString(<red>
                This directory doesn't contain a pack.
                Run the <blue>init</blue> command to initialize a pack
            </red>)
        },

        compiling(from: any, to: any) {
            return getString(<green>
                Compiling <blue>{from}</blue> {arrow} <blue>{to}</blue> 
            </green>)
        },
        creating(file: any) {
            return getString(<green>
                Creating <blue>{file}</blue>
            </green>)
        },
        exported(zip: any) {
            return getString(<green>
                Exported <blue>{zip}</blue>
            </green>)
        },
        adding(file: any) {
            return getString(<green>
                Adding <blue>{file}</blue>
            </green>)
        }
    },
} as const
