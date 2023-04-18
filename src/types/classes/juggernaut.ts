import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import Enrage from '../buffs/enrage';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import ShieldBlockBuff from '../buffs/shield-block';
import Untouchable from '../buffs/retaliation';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';
import Taunt from '../skills/taunt';


export default class Juggernaut extends PlayerIdentity {
    public name = "Juggernaut"
    public baseStats = CharacterStats.fromObject({ maxHealth: 52, armor: 3})
    public imagePath = "/classes/juggernaut.png"
    public playerClass = PlayerClass.JUGGERNAUT
    public basicSkill: Skill = new Bash()
    public color = "#7F513E";

    override onCreated(character: Character) {
        this.onDamageTakenTriggers = []
        character.classBar = new ClassBar(100, 'silver')

        character.classBar.onFilled = () => {
            if (character.classBar == null || character.classBar.activated) return
            character.addBuff(new Untouchable(), character)
        }

        this.onDamageTakenTriggers.push(this.generateResistanceOnDamage)
    }

    public skills = [
        new BodySlam(),
        new ShieldBlock(),
        new Taunt()
    ]

    generateResistanceOnDamage({ character, actualDamage, originalDamage }: OnDamageTrigger) {
        const damageReduced = originalDamage - actualDamage

        if (character.classBar && damageReduced > 0) {
            let resistanceGained = (damageReduced / character.healthBar.max) * 100

            if (!character.classBar.activated) {
                resistanceGained *= 1.3
            }

            character.classBar.increase(Math.ceil(resistanceGained))
        }
    }
}

export class Bash extends Skill {
    skillData: SkillData = new SkillData({
        name: "Bash",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1000,
        aiTargetting: AiTargetting.RANDOM,
        imagePath: "/juggernaut/bash.png"
    })

    BASE_DAMAGE = 2

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({
            amount: this.BASE_DAMAGE + castBy.stats.armor.value,
            target,
            type: DamageType.PHYSICAL,
            threatModifier: 1.2,
            minAmount: 1
        }))
    }
}

export class ShieldBlock extends Skill {
    skillData: SkillData = new SkillData({
        name: "Shield Block",
        energyCost: 4,
        cooldown: 6 * 1000,
        targetType: TargetType.TARGET_NONE,
        castTime: 400,
        imagePath: "/juggernaut/shield-block.png"
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.addBuff(new ShieldBlockBuff(), castBy)
    }
}

export class BodySlam extends Skill {
    skillData: SkillData = new SkillData({
        name: "Body Slam",
        energyCost: 3,
        cooldown: 1 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1000,
        imagePath: "/juggernaut/body-slam.png"
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 5 + castBy.stats.armor.value, target, type: DamageType.PHYSICAL, threatModifier: 1.2})
            target.dealDamageTo({ amount: 5 + target.stats.armor.value, target: castBy, type: DamageType.PHYSICAL, threatModifier: 1.2})
        })
    }
}
