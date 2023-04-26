import { OrArray } from "./common.ts"
import * as common from "./common.ts"

type X = {x?: number}
type Y = {y?: number}

type ModelPointer = ({
    model: string,
    uvlock?: boolean
} & (X | Y))|string

type Or = { or?: boolean, and?: undefined }
type And = { or?: undefined, and?: boolean }
type Condition = Record<string, string | boolean | number>

type ConditionalModel = {
    when?: Condition,
    apply: OrArray<ModelPointer>
} & (Or | And)

type StateDef = ConditionalModel|ModelPointer

export type BlockState = {
    multipart?: boolean,
    state: OrArray<StateDef>
}

export function transformBlockState(blockstate: BlockState|OrArray<StateDef>): Record<string, any> {
    if (blockstate.hasOwnProperty("state")) {
        blockstate = blockstate as BlockState
        if (blockstate.multipart)
            return transformMultipart(blockstate.state)
        return transformVariants(blockstate.state)
    }
    return transformVariants(blockstate as OrArray<StateDef>)
}

function iterate<T>(state: OrArray<T>, consumer: (state: T) => void) {
    if (Array.isArray(state)) {
        for (let i of state) {
            consumer(i)
        }
    } else {
        consumer(state)
    }
}

function transformVariants(state: OrArray<StateDef>): Record<string, any> {
    let out: Record<string, any> = {}

    function add(name: string, value: any) {
        if (out[name]) out[name].push(value)
        else out[name] = [value]
    }

    iterate(state, state => {
        if (typeof state == "string") {
            if (common.validateIdentifier(state))
                add("", {
                    model: state
                })
        } else if (state.hasOwnProperty("model")) {
            //@ts-ignore
            if (common.validateIdentifier(state.model))
                add("", state)
        } else {
            let cond = state as ConditionalModel
            let str = ""
            if (cond.when) {
                for (let i in cond.when) {
                    str = `${str},${i}=${cond.when[i]}`
                }
                str = str.substring(1)
            }
            
            iterate(cond.apply, model => {
                if (typeof model == "string") {
                    if (common.validateIdentifier(model))
                        add("", {
                            model: model
                        })
                } else {
                    //@ts-ignore
                    if (common.validateIdentifier(model.model))
                        add("", model)
                }
            })
        }
    })

    for (let k in out) {
        if (out[k].length == 1) {
            out[k] = out[k][0]
        }
    }

    return {
        "variants": out
    }
}

function transformMultipart(state: OrArray<StateDef>): Record<string, any> {
    let out: any[] = []

    iterate(state, state => {
        if (typeof state == "string") {
            if (common.validateIdentifier(state))
                out.push({
                    apply: {
                        model: state
                    }
                })
        } else if (state.hasOwnProperty("model")) {
            //@ts-ignore
            if (common.validateIdentifier(state.model))
                out.push({
                    apply: state
                })
        } else {
            let cond = state as ConditionalModel
            let when: {[k:string]: any} = {}
            if (cond.when) {
                if (cond.or) {
                    when.OR = cond.when
                } else if (cond.and) {
                    when.AND = cond.when
                } else {
                    when = cond.when
                }
            }
            let apply: any[] = []
            
            iterate(cond.apply, model => {
                if (typeof model == "string") {
                    if (common.validateIdentifier(model))
                        apply.push({
                            model: model
                        })
                } else {
                    if (common.validateIdentifier(model.model))
                        apply.push(model)
                }
            })

            if (apply.length == 1) {
                out.push({when, apply: apply[0]})
            } else if (apply.length != 0) {
                out.push({when, apply})
            }
        }
    })

    return {
        "multipart": out
    }
}
