import type Identity from "./identity"
import Item from "./item"
import type Skill from "./skill"

export default class SkillInventoryItem extends Item {
    get name(): string {
        return this.skill.skillData.name
    }

    get description(): string {
        return this.skill.description ?? 'Buy this skill'
    }

    public goldValue: number = 15

    imagePath: string|null = null

    constructor(public skill: Skill) {
        super()
    }

    override getImagePath(playerClass: Identity|null): string|null {
      return `/skills${this.skill.skillData.imagePath}`
    }
}