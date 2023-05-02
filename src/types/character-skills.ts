import type Character from "./character";
import Player from "./player";
import PlayerIdentity from "./player-identity";
import type Skill from "./skill";

export default class CharacterSkills {
    private collection: Skill[] = []

    onSkillsChangedCallbacks: (() => void)[] = []

    constructor(private character: Character, skills: Skill[], basicSkill: Skill|null) {
        if (basicSkill) {
            this.collection.push(basicSkill)
        }

        this.collection = this.collection.concat(skills)
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

    resetCooldowns() {
        this.skills.forEach((skill) => skill.finishCooldown())
    }

    applyUpgrades(): void {
        this.collection.forEach((skill) => {
            skill.skillData.resetToBase()
            
            if (skill.socketedUpgrade) {
                skill.socketedUpgrade.applyUpgrade(this.character, skill)
            }
        })
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