import type Character from '../character'
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import ShieldBlockBuff from '../buffs/shield-block';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import ShieldShatteredBuff from '../buffs/shield-shattered';
import ArmorPower from '../power/armor-power';
import RetaliationBar from '../special-bar/retaliation-bar';
import DurableShieldBlockSkillGem from '../skill-upgrades/juggernaut/durable-shield-block-skill-gem';
import MegaFortificationSkillGem from '../skill-upgrades/juggernaut/mega-fortification';
import BodyGuardBuff from '../buffs/body-guard';
import Game from '@/core/game';
import { globalThreatEvent } from '@/core/events';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import ShatterBuff from '../buffs/shatter';
import ShockWaveBuff from '../buffs/shock-wave';

export default class Juggernaut extends PlayerIdentity {
    public name = "Juggernaut"
    public baseStats = new CoreStats({
        constitution: 18,
        strength: 12,
        dexterity: 7,
        intelligence: 7
    })
    public imagePath = "/classes/juggernaut.png"
    public playerClass = PlayerClass.JUGGERNAUT
    public basicSkills: Skill[] = [new Bash(), new BodySlam()]
    public color = "#7F513E";
    public description: string = "The Juggernaut is a fearsome warrior covered in thick armor. They use their armor to protect allies and reduce incoming damage but do not underestimate them as their armor is also their greatest weapon."

    private generateResistanceOnDamageCallback = this.generateResistanceOnDamage.bind(this)

    override onCreated(character: Character) {
        character.classBar = new RetaliationBar()

        character.classBar.onFilled = () => {
            character.classBar?.activate(character)
        }

        character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.generateResistanceOnDamageCallback)
    }

    onDeleted(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.generateResistanceOnDamageCallback)
        super.onDeleted(character)
    }

    public skills = [
        new ShieldBlock(),
    ]

    possibleSkills = [
        new ShieldShatter(),
        new Fortify(),
        new ShieldBlock(),
        new Overpower(),
        new BodyGuard(),
        new Shatter(),
        new ShockWave()
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
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        aiTargetting: AiTargetting.RANDOM,
        imagePath: "/juggernaut/bash.png",
        range: SkillRange.MELEE,
    })

    description: string | null = "Basic. Deal 2 + <ARMOR> damage to an enemy"

    BASE_DAMAGE = 2

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({
            amount: this.BASE_DAMAGE + castBy.stats.derived.armor.value,
            targets,
            type: DamageType.PHYSICAL,
            threatModifier: 1.2,
            minAmount: 1
        })
    }
}

export class BodySlam extends Skill {
    skillData: SkillData = new SkillData({
        name: "Body Slam",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        imagePath: "/juggernaut/body-slam.png",
        range: SkillRange.MELEE,
    })

    description: string | null = "Basic. Body slam the target, you deal twice your armor in damage to them, but they also deal damage to you based on their armor."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: castBy.stats.derived.armor.value * 2, targets, type: DamageType.PHYSICAL, threatModifier: 1.2})

        targets.forEach((target) => {
            target.dealDamageTo({ amount: target.stats.derived.armor.value, targets: [castBy], type: DamageType.PHYSICAL, threatModifier: 1.2})
        })
    }
}

export class Overpower extends Skill {
    skillData: SkillData = new SkillData({
        name: "Overpower",
        energyCost: 6,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1500,
        imagePath: "/juggernaut/overpower.png",
        range: SkillRange.MELEE,
        damage: 12
    })

    description: string | null = "Deal 12 damage to a target. If you have more armor than the target, interupt spell casting."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: this.skillData.damage, targets: [target], type: DamageType.PHYSICAL, threatModifier: 1.2})

            if (castBy.stats.derived.armor.value > target.stats.derived.armor.value && target.castingSkill) {
                target.castingSkill.interupt()
            }
        })
    }
}

export class ShieldBlock extends Skill {
    skillData: SkillData = new SkillData({
        name: "Shield Block",
        energyCost: 4,
        cooldown: 6 * 1000,
        targetType: TargetType.TARGET_SELF,
        damageType: DamageType.PHYSICAL,
        damage: 5,
        castTime: 400,
        imagePath: "/juggernaut/shield-block.png",
        buffDuration: 5 * 1000,
        range: SkillRange.MELEE,
    })

    description: string | null = "Gain 8 Armor and your magic armor is equal to your armor until the next time you get attacked, deals 5 damage back."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new ShieldBlockBuff({
                duration: this.skillData.buffDuration,
                damage: this.skillData.damage,
                durability: this.socketedUpgrade instanceof DurableShieldBlockSkillGem ? 2 : 1
            }), castBy)
        })
    }
}

export class Shatter extends Skill {
    skillData: SkillData = new SkillData({
        name: "Shatter",
        energyCost: 3,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 400,
        imagePath: "/juggernaut/shatter.png",
        buffDuration: 8 * 1000,
        range: SkillRange.MELEE,
    })

    description: string | null = "Shatter an enemy's weapon, reducing their attack damage by 4."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new ShatterBuff({
                duration: this.skillData.buffDuration,
            }), castBy)

            target.threat?.raiseThreat(castBy, 15)
        })
    }
}

export class BodyGuard extends Skill {
    skillData: SkillData = new SkillData({
        name: "Body Guard",
        energyCost: 3,
        cooldown: 10 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 1100,
        imagePath: "/juggernaut/body-guard.png",
        buffDuration: 8 * 1000,
        range: SkillRange.MELEE,
    })

    description: string | null = "Body Guard target ally, redirecting half of the damage they take to you."

    isTargetValid(castBy: Character | undefined, target: Character | undefined): boolean {
        if (castBy?.id == target?.id) {
            return false
        }

        return super.isTargetValid(castBy, target)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new BodyGuardBuff(this.skillData.buffDuration), castBy)
        })

        Game.eventBus.publish(globalThreatEvent({
            healer: castBy,
            amount: 10
        }))
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
        castBy.dealDamageTo({ amount: castBy.stats.derived.armor.value * 2, targets, type: DamageType.PHYSICAL, minAmount: castBy.stats.derived.armor.value, threatModifier: 1.4 })

        if (castBy.buffs.hasBuff(ShieldBlockBuff)) {
            castBy.buffs.removeBuffByType(ShieldBlockBuff)
        }

        castBy.addBuff(new ShieldShatteredBuff(this.skillData.buffDuration), castBy)
    }
}

export class ShockWave extends Skill {
    skillData: SkillData = new SkillData({
        name: "Shockwave",
        energyCost: 6,
        cooldown: 16 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        castTime: 1200,
        imagePath: "/juggernaut/shock-wave.png",
        range: SkillRange.MELEE,
        buffDuration: 0.5 * 1000,
        damage: 6
    })

    description: string | null = "Deal 6 damage to all enemies and stun them for a duration based on your strength."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage, targets, type: DamageType.PHYSICAL, threatModifier: 1 })

        targets.forEach((target) => {
            target.addBuff(new ShockWaveBuff({
                duration: this.skillData.buffDuration + (500 * (castBy.stats.core.strength.value / 6))
            }), castBy)
        })
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
        targets.forEach((target) => {
            target.characterPowers.addPower(new ArmorPower())

            if (this.socketedUpgrade instanceof MegaFortificationSkillGem) {
                target.characterPowers.addPower(new ArmorPower())
            }
        })
    }
}
