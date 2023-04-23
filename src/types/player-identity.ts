import Identity from './identity'
import type ClassBar from './class-bar'
import type Skill from './skill';
import type { PlayerIdentityState } from './state/identity-state';

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
    abstract basicSkills: Skill[]
    abstract possibleSkills: Skill[]

    abstract description: string

    getPlayerIdentityState(): PlayerIdentityState {
        return Object.assign({}, this.getState(), {
            description: this.description,
            basicSkills: this.basicSkills.map((s) => s.getState(null)),
            skills: this.skills.map((sk) => sk.getState(null))
        }
        ) as PlayerIdentityState
    }
}

export default PlayerIdentity;

export { PlayerClass }