import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import ExposeArmorBuff from '../buffs/expose-armor';
import type EmpowerableSKill from '../empowerable-skill';
import Empowered from '../buffs/empowered';
import FrozenBuff from '../buffs/frozen'

abstract class MageSkill extends Skill {
    abstract empower(castBy: Character): void
    abstract unempower(castBy: Character): void
}

export default class Mage extends PlayerIdentity {
    public name = "Mage"
    public baseStats = CharacterStats.fromObject({ maxHealth: 30, armor: 1, magicalArmor: 1})
    public imagePath = "/src/assets/classes/mage.png"
    public playerClass = PlayerClass.MAGE

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'blue')
        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                if (character.classBar == null || character.classBar.activated) return
                character.addBuff(new Empowered())
            }
        }
    }

    public skills = [
        new FrostBolt()
    ]
}

class FrostBolt extends Skill implements EmpowerableSKill {
    name: string = "FrostBolt";
    energyCost: number = 2;
    cooldown: number = 0 * 1000;
    castTime = 1500
    targetType: TargetType = TargetType.TARGET_ENEMY
    aiTargetting = AiTargetting.HIGHEST_THREAT

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 7, type: DamageType.MAGICAL, target})

            if (this.empowered) {
                target.addBuff(new FrozenBuff())
            }
        })

        if (!this.empowered && castBy.classBar != null) {
            castBy.classBar.increase(25)
        }
    }

    empower(castBy: Character): void {
        this.targetType = TargetType.TARGET_ENEMY
        this.empowered = true
        this.name = "Frost Tomb"
        this.energyCost = 4
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.name = "Frost Bolt"
        this.energyCost = 2
    }
}