import type Character from '../character'
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import ShieldBlockBuff from '../buffs/shield-block';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';
import ShieldShatteredBuff from '../buffs/shield-shattered';
import ArmorPower from '../power/armor-power';
import RetaliationBar from '../special-bar/retaliation-bar';
import DurableShieldBlockSkillGem from '../skill-upgrades/juggernaut/durable-shield-block-skill-gem copy';

export default class Juggernaut extends PlayerIdentity {
    public name = "Juggernaut"
    public baseStats = CharacterStats.fromObject({ maxHealth: 52, armor: 3})
    public imagePath = "/classes/juggernaut.png"
    public playerClass = PlayerClass.JUGGERNAUT
    public basicSkills: Skill[] = [new Bash(), new BodySlam()]
    public color = "#7F513E";
    public description: string = "The Juggernaut is a fearsome warrior covered in thick armor. They use their armor to protect allies and reduce incoming damage but do not underestimate them as their armor is also their greatest weapon."

    override onCreated(character: Character) {
        this.onDamageTakenTriggers = []
        character.classBar = new RetaliationBar()

        character.classBar.onFilled = () => {
            character.classBar?.activate(character)
        }

        this.onDamageTakenTriggers.push(this.generateResistanceOnDamage)
    }

   

    public skills = [
        new ShieldBlock(),
        new ShieldShatter(),
        new Fortify()
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
        imagePath: "/juggernaut/bash.png",
        range: SkillRange.MELEE,
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

export class BodySlam extends Skill {
    skillData: SkillData = new SkillData({
        name: "Body Slam",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1000,
        imagePath: "/juggernaut/body-slam.png",
        range: SkillRange.MELEE,
    })

    description: string | null = "Basic. Body slam the target, you deal twice your armor in damage to them, but they also deal damage to you based on their armor."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: castBy.stats.armor.value * 2, target, type: DamageType.PHYSICAL, threatModifier: 1.2})
            target.dealDamageTo({ amount: target.stats.armor.value, target: castBy, type: DamageType.PHYSICAL, threatModifier: 1.2})
        })
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
        range: SkillRange.MELEE,
    })

    description: string | null = "Gain 8 Armor and your magic armor is equal to your armor, until you are attacked"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new ShieldBlockBuff({
                duration: this.skillData.buffDuration, 
                durability: this.socketedUpgrade instanceof DurableShieldBlockSkillGem ? 2 : 1
            }), castBy)
        })
    }
}

export class ShieldShatter extends Skill {
    skillData: SkillData = new SkillData({
        name: "Shield Shatter",
        energyCost: 6,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        castTime: 1200,
        imagePath: "/juggernaut/shield-shatter.png",
        range: SkillRange.MELEE,
        buffDuration: 4 * 1000,
    })

    description: string | null = "Consume all your armor and deal double the amount in piercing damage to all enemies. You lose your armor for a duration"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: castBy.stats.armor.value * 2, target, type: DamageType.PHYSICAL, minAmount: castBy.stats.armor.value, threatModifier: 1.4 })
        })

        if (castBy.buffs.hasBuff(ShieldBlockBuff)) {
            castBy.buffs.removeBuffByType(ShieldBlockBuff)
        }

        castBy.addBuff(new ShieldShatteredBuff(this.skillData.buffDuration), castBy)
    }
}

export class Fortify extends Skill {
    skillData: SkillData = new SkillData({
        name: "Fortify",
        energyCost: 5,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_SELF,
        castTime: 1250,
        imagePath: "/juggernaut/fortify.png",
        range: SkillRange.MELEE,
    })

    description: string | null = "Increases your armor by 1 for the rest of combat"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.characterPowers.addPower(new ArmorPower()))
    }
}
