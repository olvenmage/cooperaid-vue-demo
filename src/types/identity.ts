import type EnergyBar from './energy-bar'
import type Healthbar from './health-bar'
import type Skill from './skill'
import type Character from './character'

export type DamageTakenTrigger = (damageTaken: number, character: Character, damagedBy: Character|null) => void

export default abstract class Identity {
    public abstract name: string
    public abstract armor: number
    public abstract maxHealth: number
    public maxEnergy: number = 10
    public abstract imagePath: string;

    public abstract skills: Skill[]

    onDamageTakenTriggers: DamageTakenTrigger[] = []

    onCreated(character: Character) {

    }
}