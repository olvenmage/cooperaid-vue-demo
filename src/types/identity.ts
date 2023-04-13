import type EnergyBar from './energy-bar'
import type Healthbar from './health-bar'
import type Skill from './skill'
import type Character from './character'
import type ClassBar from './class-bar'
import type OnDamageTrigger from './triggers/on-damage-trigger'
import type CharacterStats from './character-stats'

export type DamageTakenTrigger = (trigger: OnDamageTrigger) => void
export type BeforeDamageTakenTrigger = (trigger: OnDamageTrigger) => number

export default abstract class Identity {
    public abstract name: string
    public abstract baseStats: CharacterStats
    public maxEnergy: number = 10
    public abstract imagePath: string;
    public classBar: ClassBar|null = null

    public abstract skills: Skill[]

    onDamageTakenTriggers: DamageTakenTrigger[] = []
    beforeDamageTakenTriggers: BeforeDamageTakenTrigger[] = []

    onCreated(character: Character) {

    }
}