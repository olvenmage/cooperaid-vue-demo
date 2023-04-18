import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import DismantleBuff from '../buffs/dismantle';
import type EmpowerableSKill from '../skill-types/empowerable-skill';
import Empowered from '../buffs/empowered';
import FrozenBuff from '../buffs/frozen'
import SkillData from '../skill-data';

export default class Mage extends PlayerIdentity {
    public name = "Mage"
    public baseStats = CharacterStats.fromObject({ maxHealth: 30, armor: 1, magicalArmor: 1})
    public imagePath = "/classes/mage.png"
    public playerClass = PlayerClass.MAGE
    public basicSkill: Skill = new FrostBolt()
    public color = "#51A5C5";

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, '#5d5abf')
        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                if (character.classBar == null || character.classBar.activated) return
                character.addBuff(new Empowered(), character)
            }
        }
    }

    public skills = []
}

export class FrostBolt extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Frostbolt",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1000,
        imagePath: "/mage/frost-bolt.png"
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 7, type: DamageType.MAGICAL, target})

            if (this.skillData.isTransformed) {
                target.addBuff(new FrozenBuff(), castBy)
            }
        })

        if (!this.skillData.isTransformed && castBy.classBar != null) {
            castBy.classBar.increase(25)
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Frost Tomb",
            imagePath: "/mage/frost-tomb.png",
            energyCost: 4,
        })
    }

    unempower(castBy: Character): void {
        this.skillData.transformBack()
    }
}