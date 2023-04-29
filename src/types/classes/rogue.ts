import type Character from '../character'
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import DismantleBuff from '../buffs/dismantle';
import SleepBuff from '../buffs/asleep';
import PoisonBuff from '../buffs/poison';
import FocusBar from '../special-bar/focus-bar'
import SkillData from '../skill-data';
import ParalyzingDartSkillGem from '../skill-upgrades/rogue/paralyzing-dart-skill-gem';
import NullifyingDismantleSkillGem from '../skill-upgrades/rogue/nullifying-dismantle-skill-gem';
import ExposingDartSkillGem from '../skill-upgrades/rogue/exposing-dart-skill-gem';
import pickRandom from '@/utils/pickRandom';
import KnifeStormSkillGem from '../skill-upgrades/rogue/knife-storm-skill-gem';
import shuffleArray from '@/utils/shuffleArray';
import EvasionBuff from '../buffs/evasion';
import QuickMovesSkillGem from '../skill-upgrades/rogue/quick-moves-skill-gem';
import Taunt from '../skills/taunt';
import ShadowStepBuff from '../buffs/shadow-step';
import ShadowSurge from '../skill-upgrades/rogue/shadow-surge';
import CoughBombBuff from '../buffs/cough-bomb';
import GameSettings from '@/core/settings';
import CooldownReductionSkillGem from '../skill-upgrades/generic/cooldown-reduction-skill-gem';
import BuffDurationSkillGem from '../skill-upgrades/generic/buff-duration-skill-gem';
import ToxicBombsSkillGem from '../skill-upgrades/rogue/toxic-bombs-skill-gem';

export default class Rogue extends PlayerIdentity {
    public name = "Rogue"
    public baseStats = new CoreStats({
        baseCrit: GameSettings.basePlayerCritChance * 2,
        constitution: 7,
        strength: 12,
        dexterity: 18, 
        intelligence: 7,
    })
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
        new Kick(),
    ]

    public possibleSkills = [
        new FanOfKnives(),
        new Dismantle(),
        new Kick(),
        new SleepDart(),
        new HeartSeeker(),
        new Evasion(),
        new KillShot(),
        new ShadowStep(),
        new CoughBomb()
    ]
}

export class FanOfKnives extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Fan of Knives",
        energyCost: 3,
        cooldown: 1 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/blade-flurry.png",
        damage: 9,
        range: SkillRange.RANGED,
    })

   
    MS_DELAY_BETWEEN_ATTACK = 50

    description: string | null = "Deal 9 damage divided between three ranged hits. (Min 1 damage per hit)"

    FOCUS_PER_ACTUAL_DAMAGE_DEALT = 2

    castSkill(castBy: Character, targets: Character[]): void {
        let damage = this.skillData.damage
        const AMOUNT_OF_ATTACKS = this.hasGem(KnifeStormSkillGem) ? 5 : 3

        for (let i = 0; i < AMOUNT_OF_ATTACKS; i++) {
            const daggerDamage = Math.round(damage / (AMOUNT_OF_ATTACKS - i))
            const target = pickRandom(targets.filter((c) => !c?.dead)) as Character

            damage -= daggerDamage

            setTimeout(() => {
                const damageResult = castBy.dealDamageTo({
                    amount: daggerDamage,
                    targets: [target],
                    type: this.skillData.damageType,
                    threatModifier: 1.1,
                    minAmount: 1
                })

                if (damageResult[0] && castBy.classBar instanceof FocusBar) {
                    castBy.classBar.increase(Math.max(damageResult[0].actualDamage, daggerDamage) * this.FOCUS_PER_ACTUAL_DAMAGE_DEALT)
                }
            }, i * this.MS_DELAY_BETWEEN_ATTACK)
        }
    }
}

export class Dismantle extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Dismantle",
        energyCost: 5,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.HIGHEST_THREAT,
        damageType: DamageType.PHYSICAL,
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

            target.addBuff(new DismantleBuff({
                duration: this.skillData.buffDuration,
                nullifies: this.hasGem(NullifyingDismantleSkillGem)
            }), castBy)
            target.threat?.raiseThreat(castBy, 8)
        })
    }
}

export class PoisonedStrike extends Skill {
    baseSkillData: SkillData = new SkillData({
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
        castBy.dealDamageTo({ targets, type: this.skillData.damageType, amount: this.skillData.damage })

        targets.forEach((target) => {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(2)
            }
           
            target.addBuff(new PoisonBuff(1, this.skillData.buffDuration!, this.skillData.maxStacks!), castBy)
        })
    }
}

export class Switchblade extends Skill {
    baseSkillData: SkillData = new SkillData({
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

            const damage = this.skillData.damage + target.stats.derived.armor.value

            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(target.stats.derived.armor.value)
            }

            castBy.dealDamageTo({ targets: [target], type: this.skillData.damageType, amount: damage, minAmount: damage })
        })
    }
}

export class Backstab extends Skill {
    baseSkillData: SkillData = new SkillData({
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
            let threatModifier = 1

            const backstabBonus = (target.threat && target.threat.getCurrentTarget()?.id !== castBy.id) || target.stats.stunned

            if (!target.threat) {
                if (castBy.classBar instanceof FocusBar) {
                    castBy.classBar.increase(3)
                }
                damage = Math.round(damage * 1.3)
                
            } else if (backstabBonus) {
                damage *= 2

                if (castBy.classBar instanceof FocusBar) {
                    castBy.classBar.increase(5)
                }

                threatModifier += 0.5
            }

            castBy.dealDamageTo({ targets: [target], type: this.skillData.damageType, amount: damage, threatModifier })
        })
    }
}


export class Kick extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Kick",
        energyCost: 4,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 500,
        imagePath: "/rogue/kick.png",
        damage: 6,
        damageType: DamageType.PHYSICAL,
        range: SkillRange.MELEE,
    })

    description: string | null = "Deal 6 damage to an enemy and interrupt their current cast."

    castSkill(castBy: Character, targets: Character[]): void {
        const results = castBy.dealDamageTo({ amount: this.skillData.damage!, targets: targets, type: this.skillData.damageType, threatModifier: 1.3 })

        for (const result of results) {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(4)
            }

            if (!result.isDodged) {
                if (result.character.castingSkill != null) {
                    result.character.castingSkill.interupt()
    
                    if (castBy.classBar instanceof FocusBar) {
                        castBy.classBar.increase(10)
                    }
                }
            }
        }
    }
}

export class SleepDart extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Sleep Dart",
        energyCost: 6,
        cooldown: 15 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        damageType: DamageType.PHYSICAL,
        imagePath: "/rogue/sleep-dart.png",
        buffDuration: 6 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Turn an enemy to sleep for a medium duration or until they take damage."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new SleepBuff({
                duration: this.skillData.buffDuration,
                paralyzes: this.hasGem(ParalyzingDartSkillGem),
                exposes: this.hasGem(ExposingDartSkillGem)
            }), castBy)
            target.threat?.raiseThreat(castBy, 6)
        })
    }
}

export class HeartSeeker extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Heartseeker",
        energyCost: 6,
        cooldown: 14 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1500,
        imagePath: "/rogue/heartseeker.png",
        damage: 14,
        range: SkillRange.RANGED,
    })

    description: string | null = "Deal 14 damage to the lowest health target, if that kills it, repeat this."

    castSkill(castBy: Character, targets: Character[]): void {
        const shoot = () => {
            const validTargets = shuffleArray(targets).filter((t) => !t.dead).sort((c1, c2) => Math.sign(c1.healthBar.current - c2.healthBar.current)) as Character[]
            let target = validTargets[0] ?? null

            if (target != null) {
                castBy.dealDamageTo({ amount: this.skillData.damage, targets: [target], type: this.skillData.damageType })

                if (target.dead) {
                    shoot()
                }
            }
        }

        shoot()
    }
}

export class KillShot extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Killshot",
        energyCost: 4,
        cooldown: 10 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1200,
        imagePath: "/rogue/killshot.png",
        damage: 12,
        range: SkillRange.RANGED,
    })

    description: string | null = "Deal 12 damage to an enemy, damage is increased by 3 per debuff on the target."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            const debuffAmount = target.buffs.filter((b) => !b.givenBy?.isEnemyTo(castBy)).length

            castBy.dealDamageTo({ targets: [target], amount: this.skillData.damage + (3 * debuffAmount ), type: DamageType.PHYSICAL})
        })
    }
}

export class Evasion extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Evasion",
        energyCost: 6,
        cooldown: 25 * 1000,
        targetType: TargetType.TARGET_SELF,
        aiTargetting: AiTargetting.RANDOM,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        imagePath: "/rogue/evasion.png",
        buffDuration: 10 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Gain +60% dodge chance for a long duration."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new EvasionBuff({
                duration: this.skillData.buffDuration,
                speedsUpOnHit: this.hasGem(QuickMovesSkillGem)
            }), castBy)
        })
    }
}

export class ShadowStep extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Shadow Step",
        energyCost: 2,
        cooldown: 10 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        aiTargetting: AiTargetting.RANDOM,
        damageType: DamageType.PHYSICAL,
        castTime: 500,
        imagePath: "/rogue/shadow-step.png",
        buffDuration: 8 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Interupt any skill being used on you. Your next damaging skill is instant cast."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.addBuff(new ShadowStepBuff({
            duration: this.skillData.buffDuration,
        }), castBy)

        targets.forEach((target) => {
            if (target.castingSkill?.currentTargets.length == 1 && target.castingSkill?.currentTargets.some((target) => target.id == castBy.id)) {
                target.castingSkill.interupt()
                target.threat?.raiseThreat(castBy, 3)
                if (castBy.classBar instanceof FocusBar) {
                    castBy.classBar.increase(3)
                }

                if (this.hasGem(ShadowSurge)) {
                    castBy.energyBar.increase(1)
                }
            }
        })
    }
}

export class CoughBomb extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Cough Bomb",
        energyCost: 3,
        cooldown: 7 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        damageType: DamageType.POISON,
        imagePath: "/rogue/cough-bomb.png",
        buffDuration: 4 * 1000,
        range: SkillRange.RANGED,
        damage: 10
    })

    description: string | null = "Deal 10 poison damage to an enemy and put a random skill they have off cooldown on cooldown."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ targets, type: this.skillData.damageType, amount: this.skillData.damage, threatModifier: 1.2 })

        targets.forEach((target) => {
            const skillToDeactivate = target.skills.find((sk) => !sk.onCooldown && sk.cooldown > 0)
            castBy?.classBar?.increase(3)
            if (skillToDeactivate) {
                skillToDeactivate?.startCooldown(target)
                castBy.classBar?.increase(6)
            }

            if (this.socketedUpgrade instanceof ToxicBombsSkillGem) {
                target.addBuff(new PoisonBuff(1, this.skillData.buffDuration!, 3), castBy)
                target.addBuff(new PoisonBuff(1, this.skillData.buffDuration!, 3), castBy)
                target.addBuff(new PoisonBuff(1, this.skillData.buffDuration!, 3), castBy)
            }
        })
    }
}