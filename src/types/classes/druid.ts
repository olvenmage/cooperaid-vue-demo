import type Character from '../character'
import Skill, { AiTargetting, SkillRange, TargetType, type CastSkillResponse } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import type EmpowerableSKill from '../skill-types/empowerable-skill';
import SkillData, { DynamicSkillDataValue } from '../skill-data';
import FerocityBar from '../special-bar/ferocity-bar'
import ThornsBuff from '../buffs/thorns-buff';
import ThickSkinBuff from '../buffs/thick-skin';
import Game from '@/core/game';
import { globalThreatEvent } from '@/core/events';
import RegrowthBuff from '../buffs/regrowth';
import EntangleBuff from '../buffs/entangle'
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import BestialWrathBuff from '../buffs/bestial-wrath';
import PrimalStrikedBuff from '../buffs/primal-striked';
import HealthyCommandNatureSkillGem from '../skill-upgrades/druid/healthy-command-skill-gem';
import CommandNatureArmorBuff from '../buffs/command-nature-armor';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import GameSettings from '@/core/settings';
import HibernateBuff from '../buffs/hibernate';
import DeepSleepSkillGem from '../skill-upgrades/druid/deep-sleep-skill-gem';
import InnervateBuff from '../buffs/innervated';
import HoneClawsBuff from '../buffs/hone-claws';
import ProtectiveScalesBuff from '../buffs/protective-scales';
import GuardingScalesSkillGem from '../skill-upgrades/druid/guarding-scales-skill-gem';

export default class Druid extends PlayerIdentity {
    public name = "Druid"
    public baseStats = new CoreStats({
        isPlayer: true,
        baseCrit: GameSettings.basePlayerCritChance,
        constitution: 11,
        strength: 12,
        dexterity: 10,
        intelligence: 11
    })
    public imagePath = "/classes/druid.png"
    public playerClass = PlayerClass.DRUID
    public basicSkills: Skill[] = [new CommandNature(), new PrimalStrike()]
    public color = "#105E26";
    public description: string = "The Druid harnesses the vast powers of nature to preserve balance and protect life. They are filled with the primal rage of nature and they have the ability to unleash it when pushed far enough."

    private generateFerocityOnDamageCallback = this.generateFerocityOnDamage.bind(this)

    override onCreated(character: Character) {
        character.classBar = new FerocityBar()

        character.classBar.onFilled = () => {
            character.classBar?.activate(character)
        }

        character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.generateFerocityOnDamageCallback)
    }

    onDeleted(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.generateFerocityOnDamageCallback)

        super.onDeleted(character)
    }

    public skills = [
        new Regrowth()
    ]

    possibleSkills = [
        new Thorns(),
        new Regrowth(),
        new Entangle(),
        new Renewal(),
        new Innervate(),
        new ProtectiveScales()
    ]

    generateFerocityOnDamage({character, actualDamage, damagedBy}: OnDamageTrigger) {
        if (character.classBar == null || character.dead || actualDamage == 0 || damagedBy?.id == character.id) {
            return
        }

        character.classBar.increase(3)
    }
}

export class CommandNature extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Command Nature",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ANY,
        castTime: 500,
        imagePath: "/druid/command-nature.png",
        buffDuration: 6 * 1000,
        damageType: DamageType.MAGICAL,
        range: SkillRange.RANGED,
    })

    description: string | null = "Basic. Apply a stacking armor buff or debuff, depending if the target is friend or foe."

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            castBy.dealDamageTo({ amount: this.skillData.damage.value, type: this.skillData.damageType!, targets, threatModifier: 1.5})
        } else {
            targets.forEach((target) => {
                target.addBuff(new CommandNatureArmorBuff({
                    duration: this.skillData.buffDuration,
                    restoresHealthOnExpire: this.hasGem(HealthyCommandNatureSkillGem)
                }), castBy)

                if (target.isEnemyTo(castBy)) {
                    Game.eventBus.publish(globalThreatEvent({ healer: castBy, amount: 4}))
                } else {
                    Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 2}))
                    Game.eventBus.publish(globalThreatEvent({ healer: castBy, amount: 2}))
                }
            })
    
        }
      
        if (!this.empowered && castBy.classBar != null) {
            castBy.classBar.increase(7)
        }
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 20
    }

    empower(castBy: Character): void {
        this.baseSkillData.transform({
            name: "Swipe",
            energyCost: 2,
            targetType: TargetType.TARGET_ENEMY,
            imagePath: "/druid/bear/swipe.png",
            castTime: 1000,
            damageType: DamageType.PHYSICAL,
            range: SkillRange.MELEE,
            damage: new DynamicSkillDataValue(5).modifiedBy('strength', 1.1)
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.baseSkillData.transformBack()
    }
}

export class PrimalStrike extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Primal Strike",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ANY,
        castTime: 500,
        imagePath: "/druid/primal-strike.png",
        buffDuration: 5 * 1000,
        damageType: DamageType.PHYSICAL,
        maxStacks: 4,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(2).modifiedBy('strength', 0.8),
    })

    description: string | null = "Basic. Deal {damage} physical damage to an enemy, or deal 1 piercing damage to an ally and give them a stacking cast speed buff"

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            castBy.dealDamageTo({ amount: this.skillData.damage.value, type: this.skillData.damageType, targets, threatModifier: 1.3})
        } else {
            targets.forEach((target) => {
                if (target.isEnemyTo(castBy)) {
                    castBy.dealDamageTo({ amount: this.skillData.damage.value, type: this.skillData.damageType!, targets: [target]})
                } else {
                    castBy.dealDamageTo({ amount: 1, minAmount: 1, type: DamageType.BLEED, targets: [target], noCrit: true  })
                    target.addBuff(new PrimalStrikedBuff(this.skillData.buffDuration), castBy)
                    Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 3}))
                    Game.eventBus.publish(globalThreatEvent({ healer: castBy, amount: 1}))
                }
            })
    
        }
      
        if (!this.empowered && castBy.classBar != null) {
            castBy.classBar.increase(7)
        }
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 20
    }

    empower(castBy: Character): void {
        this.baseSkillData.transform({
            name: "Swipe",
            energyCost: 2,
            targetType: TargetType.TARGET_ENEMY,
            imagePath: "/druid/bear/swipe.png",
            castTime: 1000,
            damageType: DamageType.PHYSICAL,
            range: SkillRange.MELEE,
            damage: new DynamicSkillDataValue(5).modifiedBy('strength', 1.1),
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.baseSkillData.transformBack()
    }
}

export class Thorns extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Thorns",
        energyCost: 2,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        damageType: DamageType.PHYSICAL,
        castTime: 750,
        imagePath: "/druid/thorns.png",
        buffDuration: 10 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Buff an ally to deal 5 damage when they are damaged."

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            castBy.dealDamageTo({ amount: this.skillData.damage.value, minAmount: 1, targets, type: this.skillData.damageType })
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
        this.baseSkillData.transform({
            name: "Sharp Spines",
            energyCost: 2,
            targetType: TargetType.TARGET_ALL_ENEMIES,
            imagePath: "/druid/bear/sharp-spines.png",
            castTime: 1000,
            damage: new DynamicSkillDataValue(1).modifiedBy('strength', 0.5),
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.baseSkillData.transformBack()
    }
}

export class Renewal extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Renewal",
        energyCost: 6,
        cooldown: 18 * 1000,
        targetType: TargetType.TARGET_ANY,
        damageType: DamageType.MAGICAL,
        castTime: 750,
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
                    } else if (!target.isEnemyTo(castBy) && !buff.givenBy?.isEnemyTo(target)) {
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
        this.baseSkillData.transform({
            name: "Bestial Wrath",
            energyCost: 5,
            targetType: TargetType.TARGET_SELF,
            imagePath: "/druid/bear/bestial-wrath.png",
            castTime: 1000,
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.baseSkillData.transformBack()
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class Regrowth extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Regrowth",
        energyCost: 4,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        damageType: DamageType.MAGICAL,
        castTime: 500,
        imagePath: "/druid/regrowth.png",
        buffDuration: 12 * 1000,
        healing: new DynamicSkillDataValue(8).modifiedBy('intelligence', 1.2),
        range: SkillRange.RANGED,
    })

    description: string | null = "Buff an ally to restore {healing} health over time."

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            castBy.addBuff(new HibernateBuff({
                duration: (this.skillData.buffDuration / 2),
                doesntInteruptOnDamage: this.socketedUpgrade instanceof DeepSleepSkillGem
            }), castBy )

            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.decrease(35)
            }
        } else {
            targets.forEach((target) => {
                target.addBuff(new RegrowthBuff({
                    duration: this.skillData.buffDuration,
                    totalHealAmount: this.skillData.healing.value
                }), castBy)
            })

            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.increase(6)
            }
        }
    }

    empower(castBy: Character): void {
        this.baseSkillData.transform({
            name: "Hibernate",
            energyCost: 2,
            targetType: TargetType.TARGET_SELF,
            imagePath: "/druid/bear/calm.png",
            castTime: 1000,
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.baseSkillData.transformBack()
    }
}

export class Entangle extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Entangle",
        energyCost: 4,
        cooldown: 14 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.MAGICAL,
        range: SkillRange.RANGED,
        imagePath: "/druid/entangle.png",
        castTime: 1000,
        damage: 8,
        buffDuration: 3 * 1000,
        intelligenceDamageModifier: 0.4
    })

    description: string | null = "Entangles an enemy for a short duration, dealing magical damage and reducing their energy regen and cast speed by 100%"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        if (this.skillData.isTransformed) {
            castBy.dealDamageTo({ amount: 14, targets, type: DamageType.PHYSICAL, threatModifier: 1.4 })

            targets.forEach((target) => {
                if (target.castingSkill) {
                    target.castingSkill.interupt()
                }
            })
        } else {
            castBy.dealDamageTo({ amount: this.skillData.damage, type: DamageType.MAGICAL, targets })

            targets.forEach((target) => {
                target.addBuff(new EntangleBuff(this.skillData.buffDuration), castBy)
                target.raiseThreat(castBy, 6)
            })
        }
    }

    empower(castBy: Character): void {
        this.baseSkillData.transform({
            name: "Big Bite",
            energyCost: 6,
            damageType: DamageType.PHYSICAL,
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

export class Innervate extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Innervate",
        energyCost: 3,
        cooldown: 18 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        damageType: DamageType.MAGICAL,
        range: SkillRange.RANGED,
        imagePath: "/druid/innervate.png",
        castTime: 750,
        buffDuration: 8 * 1000
    })

    description: string | null = "Increases an ally's energy regen by 50% for a duration."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        if (this.skillData.isTransformed) {
           targets.forEach((target) => {
            targets.forEach((target) => {
                target.addBuff(new HoneClawsBuff({ duration: this.skillData.buffDuration * 2 }), castBy)
            })
           })
        } else {
            targets.forEach((target) => {
                target.addBuff(new InnervateBuff({ duration: this.skillData.buffDuration }), castBy)
            })

            Game.eventBus.publish(globalThreatEvent({
                healer: castBy,
                amount: 12
            }))
        }
    }

    empower(castBy: Character): void {
        this.baseSkillData.transform({
            name: "Hone claws",
            energyCost: 3,
            targetType: TargetType.TARGET_SELF,
            imagePath: "/druid/bear/hone-claws.png",
            castTime: 1000,
        })
    }

    unempower(castBy: Character): void {
        this.skillData.transformBack()
    }
}


export class ProtectiveScales extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Protective Scales",
        energyCost: 3,
        cooldown: 18 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        damageType: DamageType.MAGICAL,
        range: SkillRange.RANGED,
        imagePath: "/druid/protective-scales.png",
        castTime: 1000,
        buffDuration: 12 * 1000
    })

    description: string | null = "Protect an ally, nullifying the next debuff they receive."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        if (this.skillData.isTransformed) {
            castBy.addBuff(new ThickSkinBuff(), castBy)
        } else {
            targets.forEach((target) => {
                target.addBuff(new ProtectiveScalesBuff({
                    duration: this.skillData.buffDuration,
                    protects: this.hasGem(GuardingScalesSkillGem)
                }), castBy)
            })

            Game.eventBus.publish(globalThreatEvent({
                healer: castBy,
                amount: 8
            }))
        }
    }

    empower(castBy: Character): void {
        this.baseSkillData.transform({
            name: "Thick Skin",
            energyCost: 4,
            targetType: TargetType.TARGET_NONE,
            imagePath: "/druid/bear/thick-skin.png",
            castTime: 1000,
            range: SkillRange.MELEE,
        })
    }

    unempower(castBy: Character): void {
        this.skillData.transformBack()
    }
}