import type Character from "./character";
import type { DealDamageToParams } from "./damage";
import type { BeforeDealDamageTrigger } from "./identity";
import type SkillData from "./skill-data";
import type OnDamageTrigger from "./triggers/on-damage-trigger";
import type OnDodgeTrigger from "./triggers/on-dodge.trigger";

export enum CHARACTER_TRIGGERS {
    BEFORE_SKILL_START_CAST,
    BEFORE_SKILL_CAST,
    BEFORE_SPELL,
    BEFORE_DAMAGE_TAKEN,
    ON_DAMAGE_TAKEN,
    BEFORE_DAMAGE_DEALT,
    ON_DODGE
}

type CharacterTriggerCallback<E extends Record<any, any>> = (trigger: CharacterTriggerPayload<E>) => any

export type CharacterTriggerPayload<E extends Record<any, any>> = {
    character: Character
} & E

type CharacterTriggerCallbacks = {
    [CHARACTER_TRIGGERS.BEFORE_SKILL_START_CAST]: SkillData,
    [CHARACTER_TRIGGERS.BEFORE_SKILL_CAST]: SkillData,
    [CHARACTER_TRIGGERS.BEFORE_SPELL]: {test: 'hello'},
    [CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN]: OnDamageTrigger,
    [CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN]: OnDamageTrigger,
    [CHARACTER_TRIGGERS.BEFORE_DAMAGE_DEALT]: DealDamageToParams,
    [CHARACTER_TRIGGERS.ON_DODGE]: OnDodgeTrigger,
}

export default class CharacterTriggers {
    private registeredCallbacks: Record<CHARACTER_TRIGGERS, CharacterTriggerCallback<CharacterTriggerPayload<any>>[]> = {
        [CHARACTER_TRIGGERS.BEFORE_SKILL_CAST]: [],
        [CHARACTER_TRIGGERS.BEFORE_SKILL_START_CAST]: [],
        [CHARACTER_TRIGGERS.BEFORE_SPELL]: [],
        [CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN]: [],
        [CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN]: [],
        [CHARACTER_TRIGGERS.BEFORE_DAMAGE_DEALT]: [],
        [CHARACTER_TRIGGERS.ON_DODGE]: [],
    }

    constructor(private character: Character) {

    }

    on<T extends CHARACTER_TRIGGERS>(trigger: T, callback: CharacterTriggerCallback<CharacterTriggerPayload<CharacterTriggerCallbacks[T]>>) {
        this.registeredCallbacks[trigger].push(callback)
    }

    off<T extends CHARACTER_TRIGGERS>(trigger: T, callback: CharacterTriggerCallback<CharacterTriggerPayload<CharacterTriggerCallbacks[T]>>) {
        const index = this.registeredCallbacks[trigger].findIndex((trigger) => trigger == callback)

        if (index != -1) {
            this.registeredCallbacks[trigger].splice(index, 1)
        }
    }

    getTriggers<T extends CHARACTER_TRIGGERS>(trigger: T) {
        return this.registeredCallbacks[trigger]
    }

    publish<T extends CHARACTER_TRIGGERS>(trigger: T, payload: CharacterTriggerCallbacks[T]) {
        this.registeredCallbacks[trigger].forEach((callback) => {
            callback(Object.assign(payload, { character: this.character }))
        })
    }
}