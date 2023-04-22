import type { CharacterSkill } from "./character-state"

export default interface IdentityState {
    name: string
    color: string
    imagePath: string|null
}

export interface PlayerIdentityState extends IdentityState {
    description: string,
    skills: CharacterSkill[]
    basicSkills: CharacterSkill[]
}