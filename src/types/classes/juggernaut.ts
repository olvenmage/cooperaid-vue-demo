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
import type SkillUpgradeGem from '../skill-upgrade';
import ShieldBlockAlliesSkillGem from '../skill-upgrades/juggernaut/shield-block-allies-skill-gem';


export default class Juggernaut extends PlayerIdentity {
    public name = "Juggernaut"
    public baseStats = CharacterStats.fromObject({ maxHealth: 52, armor: 3})
    public imagePath = "/classes/juggernaut.png"
    public playerClass = PlayerClass.JUGGERNAUT
    public basicSkill: Skill = new Bash()
    public color = "#7F513E";
    public description: string = "The Juggernaut is a fearsome warrior covered in thick armor. They use their armor to protect allies and reduce incoming damage but do not underestimate them as their armor is also their greatest weapon."

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

    description: string | null = "Basic. Deal 2 + <ARMOR> damage to an enemy"

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
        targetType: TargetType.TARGET_SELF,
        castTime: 400,
        imagePath: "/juggernaut/shield-block.png",
        buffDuration: 5 * 1000,
    })

    description: string | null = "Gain 8 Armor and your magic armor is equal to your armor, until you are attacked"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new ShieldBlockBuff(this.skillData.buffDuration, ), castBy)
        })
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

    description: string | null = "Body slam the target, you deal twice your armor in damage to them, but they also deal damage to you based on their armor."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: castBy.stats.armor.value * 2, target, type: DamageType.PHYSICAL, threatModifier: 1.2})
            target.dealDamageTo({ amount: target.stats.armor.value, target: castBy, type: DamageType.PHYSICAL, threatModifier: 1.2})
        })
    }
}
