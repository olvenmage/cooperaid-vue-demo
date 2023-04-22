import type Character from '../character'
import Skill, { AiTargetting, SkillRange, TargetType, type CastSkillResponse } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import Ferocious from '../buffs/ferocious';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import type EmpowerableSKill from '../skill-types/empowerable-skill';
import SkillData from '../skill-data';
import FerocityBar from '../special-bar/ferocity-bar'
import ThornsBuff from '../buffs/thorns-buff';
import ThickSkinBuff from '../buffs/thick-skin';
import NaturesProtectionBuff from '../buffs/nature-her-protection';
import Game from '@/core/game';
import { globalThreatEvent } from '@/core/events';
import Taunt from '../skills/taunt';
import RegrowthBuff from '../buffs/regrowth';
import EntangleBuff from '../buffs/entangle'
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import BestialWrathBuff from '../buffs/bestial-wrath';

export default class Druid extends PlayerIdentity {
    public name = "Druid"
    public baseStats = CharacterStats.fromObject({ maxHealth: 35, armor: 1, magicalArmor: 1})
    public imagePath = "/classes/druid.png"
    public playerClass = PlayerClass.DRUID
    public basicSkill: Skill = new CommandNature()
    public color = "#105E26";
    public description: string = "The Druid harnesses the vast powers of nature to preserve balance and protect life. They are filled with the primal rage of nature and they have the ability to unleash it when pushed far enough."

    override onCreated(character: Character) {
        character.classBar = new FerocityBar()
        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                if (character.classBar == null || character.classBar.activated) return
                character.addBuff(new Ferocious(), character)
            }
        }

        this.onDamageTakenTriggers.push(this.generateFerocityOnDamage)
    }

    public skills = [
        new Thorns(),
        new Regrowth(),
        new Entangle(),
        new Renewal(),
    ]

    generateFerocityOnDamage({character, actualDamage, damagedBy}: OnDamageTrigger) {
        if (character.classBar == null || character.dead || actualDamage == 0 || damagedBy?.id == character.id) {
            return
        }

        character.classBar.increase(3)
    }
}

export class CommandNature extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Command Nature",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ANY,
        castTime: 1000,
        imagePath: "/druid/command-nature.png",
        buffDuration: 5 * 1000,
        damageType: DamageType.MAGICAL,
        range: SkillRange.RANGED,
    })

    description: string | null = "Basic. Deal 5 magic damage to an enemy, or give armor to an ally for a medium duration (stacks 3 times)"

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            targets.forEach((target) => {
                castBy.dealDamageTo({ amount: 12, type: this.skillData.damageType!, target, threatModifier: 1.5})
            })
    
        } else {
            targets.forEach((target) => {
                if (target.isEnemyTo(castBy)) {
                    castBy.dealDamageTo({ amount: 5, type: this.skillData.damageType!, target})

                } else {
                    target.addBuff(new NaturesProtectionBuff(this.skillData.buffDuration), castBy)
                    Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 2}))
                    Game.eventBus.publish(globalThreatEvent({ healer: castBy, amount: 2}))
                }
            })
    
        }
      
        if (!this.empowered && castBy.classBar != null) {
            castBy.classBar.increase(5)
        }
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 20
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Swipe",
            energyCost: 3,
            targetType: TargetType.TARGET_ENEMY,
            imagePath: "/druid/bear/swipe.png",
            castTime: 1000,
            damageType: DamageType.PHYSICAL,
            range: SkillRange.MELEE,
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.skillData.transformBack()
    }
}

export class Thorns extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Thorns",
        energyCost: 2,
        cooldown: 11 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 1250,
        imagePath: "/druid/thorns.png",
        buffDuration: 10 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Buff an ally to deal 5 damage when they are damaged."

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            castBy.addBuff(new ThickSkinBuff(), castBy)
        } else {
            targets.forEach((target) => {
                target.addBuff(new ThornsBuff(this.skillData.buffDuration), castBy)
                Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 6}))
                Game.eventBus.publish(globalThreatEvent({ healer: castBy, amount: 4}))
            })

            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.increase(8)
            }
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Thick Skin",
            energyCost: 4,
            targetType: TargetType.TARGET_NONE,
            imagePath: "/druid/bear/thick-skin.png",
            castTime: 1000,
            range: SkillRange.MELEE,
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.skillData.transformBack()
    }
}

export class Renewal extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Renewal",
        energyCost: 7,
        cooldown: 18 * 1000,
        targetType: TargetType.TARGET_ANY,
        castTime: 1200,
        imagePath: "/druid/renewal.png",
        range: SkillRange.RANGED,
    })

    description: string | null = "Refresh the duration of buffs on an ally, or debuffs on an enemy."

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            targets.forEach((target) => {
                target.addBuff(new BestialWrathBuff(10 * 1000), castBy)
            })
        } else {
            targets.forEach((target) => {
                target.buffs.forEach((buff) => {
                    if (target.isEnemyTo(castBy) && !buff.givenBy?.isEnemyTo(target)) {
                        buff.durationCounter = 0
                    } else if (!target.isEnemyTo(castBy) && buff.givenBy?.isEnemyTo(target)) {
                        buff.durationCounter = 0
                    }
                })
            })

            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.increase(6)
            }
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Bestial Wrath",
            energyCost: 5,
            targetType: TargetType.TARGET_SELF,
            imagePath: "/druid/bear/bestial-wrath.png",
            castTime: 1000,
            canCastOnCooldown: true
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.skillData.transformBack()
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class Regrowth extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Regrowth",
        energyCost: 4,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 1200,
        imagePath: "/druid/regrowth.png",
        buffDuration: 12 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Buff an ally to restore 16 health over time."

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.decrease(35)
            }
        } else {
            targets.forEach((target) => {
                target.addBuff(new RegrowthBuff(this.skillData.buffDuration), castBy)
            })

            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.increase(6)
            }
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Calm",
            energyCost: 2,
            targetType: TargetType.TARGET_NONE,
            imagePath: "/druid/bear/calm.png",
            castTime: 1000,
            canCastOnCooldown: true
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.skillData.transformBack()
    }
}

export class Entangle extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Entangle",
        energyCost: 4,
        cooldown: 14 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        range: SkillRange.RANGED,
        imagePath: "druid/entangle.png",
        castTime: 1500,
        buffDuration: 4 * 1000
    })

    description: string | null = "Entangles an enemy for a short duration, setting their speed and energy boost to 0."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        if (this.skillData.isTransformed) {
            targets.forEach((target) => {
                castBy.dealDamageTo({ amount: 14, target, type: DamageType.PHYSICAL, threatModifier: 1.4 })

                if (target.castingSkill) {
                    target.castingSkill.interupt()
                }
            })
        } else {
            targets.forEach((target) => {
                target.addBuff(new EntangleBuff(this.skillData.buffDuration), castBy)
                target.raiseThreat(castBy, 10)
            })
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Big Bite",
            energyCost: 6,
            targetType: TargetType.TARGET_ENEMY,
            imagePath: "/druid/bear/big-bite.png",
            castTime: 1400,
            damage: 14
        })
    }

    unempower(castBy: Character): void {
        this.skillData.transformBack()
    }
}