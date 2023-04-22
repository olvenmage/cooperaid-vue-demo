import type Character from '../character'
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import DismantleBuff from '../buffs/dismantle';
import SleepBuff from '../buffs/asleep';
import PoisonBuff from '../buffs/poison';
import FocusBar from '../special-bar/focus-bar'
import SkillData from '../skill-data';

export default class Rogue extends PlayerIdentity {
    public name = "Rogue"
    public baseStats = CharacterStats.fromObject({ maxHealth: 35, armor: 2})
    public maxHealth = 35
    public imagePath = "/classes/rogue.png"
    public playerClass = PlayerClass.ROGUE
    public basicSkills: Skill[] = [new PoisonedStrike(), new Backstab(), new Switchblade()]
    public armor = 2
    public color = "#AB6DAC";
    public description: string = "For the rogue, the only code is the contract, and their honor is purchased in gold. Free from the constraints of a conscience, these merceranier rely on brutal and efficient tactics. Lethal assassins and masters of deception and control."

    override onCreated(character: Character) {
        character.classBar = new FocusBar()

        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                character.classBar?.activate(character)
            }
        }
    }

    public skills = [
        new FanOfKnives(),
        new Dismantle(),
        new Kick(),
        new SleepDart()
    ]
}

export class FanOfKnives extends Skill {
    skillData: SkillData = new SkillData({
        name: "Fan of Knives",
        energyCost: 3,
        cooldown: 1.5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/blade-flurry.png",
        damage: 9,
        range: SkillRange.RANGED,
    })

    AMOUNT_OF_ATTACKS = 3
    MS_DELAY_BETWEEN_ATTACK = 50

    description: string | null = "Deal 3 damage to an enemy three times. (Min 1 damage per hit)"

    FOCUS_PER_ACTUAL_DAMAGE_DEALT = 2

    castSkill(castBy: Character, targets: Character[]): void {
        let damage = this.skillData.damage

        targets.forEach((target) => {
            for (let i = 0; i < this.AMOUNT_OF_ATTACKS; i++) {
                const daggerDamage = Math.round(damage / (this.AMOUNT_OF_ATTACKS - i))

                damage -= daggerDamage

                setTimeout(() => {
                    const damageResult = castBy.dealDamageTo({
                        amount: daggerDamage,
                        target,
                        type: DamageType.PHYSICAL,
                        threatModifier: 1.1,
                        minAmount: 1
                    })

                    if (damageResult && castBy.classBar instanceof FocusBar) {
                        castBy.classBar.increase(Math.max(damageResult.actualDamage, daggerDamage) * this.FOCUS_PER_ACTUAL_DAMAGE_DEALT)
                    }
                }, i * this.MS_DELAY_BETWEEN_ATTACK)
            }
        })
    }
}

export class Dismantle extends Skill {
    skillData: SkillData = new SkillData({
        name: "Dismantle",
        energyCost: 5,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.HIGHEST_THREAT,
        castTime: 500,
        imagePath: "/rogue/dismantle.png",
        buffDuration: 8 * 1000,
        range: SkillRange.MELEE,
    })

    description: string | null = "Reduce an enemy's armor by 3 for a long duration."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(4)
            }

            target.addBuff(new DismantleBuff(this.skillData.buffDuration!), castBy)
            target.ai?.raiseThreat(castBy, 8)
        })
    }
}

export class PoisonedStrike extends Skill {
    skillData: SkillData = new SkillData({
        name: "Poisoned Strike",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/poisoned-strike.png",
        damageType: DamageType.PHYSICAL,
        damage: 4,
        buffDuration: 6 * 1000,
        maxStacks: 3,
        range: SkillRange.MELEE,
    })

    description: string | null = "Basic. Deal 4 damage to an enemy and apply a stacking poison debuff for a medium duration (stacks 3 times)"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(2)
            }

            castBy.dealDamageTo({ target, type: DamageType.PHYSICAL, amount: this.skillData.damage! })
            target.addBuff(new PoisonBuff(1, this.skillData.buffDuration!, this.skillData.maxStacks!), castBy)
        })
    }
}

export class Switchblade extends Skill {
    skillData: SkillData = new SkillData({
        name: "Switchblade",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/switchblade.png",
        damageType: DamageType.PHYSICAL,
        damage: 4,
        range: SkillRange.MELEE,
    })

    description: string | null = "Basic. Deal 4 + target enemy's armor in piercing damage"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(2)
            }

            const damage = this.skillData.damage + target.stats.armor.value

            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(target.stats.armor.value)
            }

            castBy.dealDamageTo({ target, type: DamageType.PHYSICAL, amount: damage, minAmount: damage })
        })
    }
}

export class Backstab extends Skill {
    skillData: SkillData = new SkillData({
        name: "Backstab",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/backstab.png",
        damageType: DamageType.PHYSICAL,
        damage: 5,
        range: SkillRange.MELEE,
    })

    description: string | null = "Basic. Deal 5 damage to an enemy, deals double damage if the enemy is attacking someone else."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(3)
            }

            let damage = this.skillData.damage

            if (castBy.ai) {
                if (castBy.ai.getHighestThreatTarget()?.id !== castBy.id) {
                    damage *= 2
                }
            } else {
                if (castBy.classBar instanceof FocusBar) {
                    castBy.classBar.increase(5)
                }
                damage = Math.round(damage * 1.3)
            }

            castBy.dealDamageTo({ target, type: DamageType.PHYSICAL, amount: damage })
        })
    }
}


export class Kick extends Skill {
    skillData: SkillData = new SkillData({
        name: "Kick",
        energyCost: 4,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 250,
        imagePath: "/rogue/kick.png",
        damage: 8,
        damageType: DamageType.PHYSICAL,
        range: SkillRange.MELEE,
    })

    description: string | null = "Deal 8 damage to an enemy and interrupt their current cast."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: this.skillData.damage!, target, type: this.skillData.damageType!, threatModifier: 1.3 })

            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(4)
            }
            
            if (target.castingSkill != null) {
                target.castingSkill.interupt()

                if (castBy.classBar instanceof FocusBar) {
                    castBy.classBar.increase(10)
                }
            }
        })
    }
}

export class SleepDart extends Skill {
    skillData: SkillData = new SkillData({
        name: "Sleep Dart",
        energyCost: 6,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/sleep-dart.png",
        buffDuration: 6 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Turn an enemy to sleep for a medium duration or until they take damage."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new SleepBuff(this.skillData.buffDuration!), castBy)
            target.ai?.raiseThreat(castBy, 6)
        })
    }
}

