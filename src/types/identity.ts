import type EnergyBar from './energy-bar'
import type Healthbar from './health-bar'
import type Skill from './skill'
import type Character from './character'
import type ClassBar from './class-bar'
import type OnDamageTrigger from './triggers/on-damage-trigger'
import type IdentityState from './state/identity-state'
import type { DealDamageToParams } from './damage'
import type { CoreStats } from './character-stats'

export type DamageTakenTrigger = (trigger: OnDamageTrigger) => void
export type BeforeDamageTakenTrigger = (trigger: OnDamageTrigger) => number
export type BeforeDealDamageTrigger = (trigger: DealDamageToParams, damagedBy: Character) => DealDamageToParams

export default abstract class Identity {
    public abstract name: string
    public abstract baseStats: CoreStats
    public maxEnergy: number = 10
    public abstract imagePath: string;
    public classBar: ClassBar|null = null
    public color = "darkgray";

    public abstract skills: Skill[]

    protected onDeletedCallbacks: (() => void)[] = []

    onDamageTakenTriggers: DamageTakenTrigger[] = []
    beforeDamageTakenTriggers: BeforeDamageTakenTrigger[] = []
    beforeDealDamageTriggers: BeforeDealDamageTrigger[] = []

    onCreated(character: Character) {

    }

    getState(): IdentityState {
        return {
            name: this.name,
            color: this.color,
            imagePath: this.imagePath
        }
    }

    onDeleted(character: Character) {
        this.onDeletedCallbacks.forEach((cb) => cb())
    }
}