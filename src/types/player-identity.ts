import Identity from './identity'
import type ClassBar from './class-bar'
import type Skill from './skill';

enum PlayerClass {
    BARBARIAN = 0,
    JUGGERNAUT = 1,
    MAGE = 2,
    PALADIN = 3,
    DRUID = 4,
    ROGUE = 5
}

abstract class PlayerIdentity extends Identity {
    abstract playerClass: PlayerClass
    abstract basicSkill: Skill

    abstract description: string

    getPlayerIdentityState(): PlayerIdentity {
        const skills = [
            this.basicSkill,
            ...this.skills,
        ]
        return Object.assign({}, this.getState(), { description: this.description, skills: skills.map((sk) => sk.getState(null)) }) as PlayerIdentity
    }
}

export default PlayerIdentity;

export { PlayerClass }