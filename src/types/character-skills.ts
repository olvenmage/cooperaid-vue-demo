import type Character from "./character";
import Player from "./player";
import PlayerIdentity from "./player-identity";
import type Skill from "./skill";

export default class CharacterSkills {
    private character: Character
    private collection: Skill[] = []
    
    onSkillsChangedCallbacks: (() => void)[] = []

    constructor(character: Character) {
        this.character = character

        const basicSkill = null

        if (character.identity instanceof PlayerIdentity) {
            this.collection.push(character.identity.basicSkill)
        }

        this.collection = this.collection.concat(character.identity.skills)
    }
 
    get skills() {
        return this.collection
    }

    addSkill(skill: Skill) {
        this.collection.push(skill)      
        this.onSkillsChangedCallbacks.forEach((cb) => cb())  
    }
    
    onSkillsChanged(callback: () => void) {
        this.onSkillsChangedCallbacks.push(callback)
    }

    removeSkill(skillClass: typeof Skill): this {
        const index = this.collection.findIndex((item) => item instanceof skillClass)

        if (index != -1) {
            this.collection.splice(index, 1)
        }

        return this
    }

    hasBuff(skillClass: typeof Skill): boolean {
        return this.collection.some((collectionBuff) => collectionBuff instanceof skillClass)
    }

    addSkills(skills: Skill[]) {
        skills.forEach((skill) => this.addSkill(skill))
    }
}