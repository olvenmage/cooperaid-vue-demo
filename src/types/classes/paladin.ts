import type Character from '../character'
import Skill, { SkillRange, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import Game from '@/core/game';
import { characterDiedEvent, globalThreatEvent } from '@/core/events';
import SavingGrace from '../buffs/saving-grace';
import BlessingOfProtectionBuff from '../buffs/blessing-of-protection'
import SmittenBuff from '../buffs/smitten';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData, { DynamicSkillDataValue } from '../skill-data';
import HolyPowerBar from '../special-bar/holy-power-bar';
import type { AppSocketSubscription } from '@/app-socket/lib/core/types';
import OverwhelmingMartyrdom from '../skill-upgrades/paladin/overwhelming-martyrdom';
import RejuvenatingLight from '../skill-upgrades/paladin/rejuvenating-light';
import FinishingStrikeSkilGem from '../skill-upgrades/paladin/finishing-strike';
import BrandingSmiteSkillGem from '../skill-upgrades/paladin/branding-smite';
import BlessedWeaponBuff from '../buffs/blessed-weapon';
import WeaponOfRightenousnessSkillGem from '../skill-upgrades/paladin/weapon-of-righteousness';
import HammerOfJusticeBuff from '../buffs/hammer-of-justice';
import HammerOfRetributionSkillGem from '../skill-upgrades/paladin/hammer-of-retribution';
import HammerOfRestorationSkillGem from '../skill-upgrades/paladin/hammer-of-restoration';
import HammerOfVengeanceSkillGem from '../skill-upgrades/paladin/hammer-of-vengeance';
import GameSettings from '@/core/settings';
import DivineJudgementBuff from '../buffs/divine-judgement';


export default class Paladin extends PlayerIdentity {
    public name = "Paladin"
    public baseStats = new CoreStats({
        isPlayer: true,
        baseCrit: GameSettings.basePlayerCritChance,
        constitution: 13,
        strength: 12,
        dexterity: 6,
        intelligence: 13
    })
    public imagePath = "/classes/paladin.png"
    public playerClass = PlayerClass.PALADIN
    public basicSkills: Skill[] = [new HolyShock(), new HolyStrike()]
    public color = "#ffdf00";
    public description = "The Paladin vows to protect the weak and bring justice to the unjust They are equiped with plate armor so they can confront the toughest of foes, and the blessing of their God allows them to heal wounds and wield powerful holy magic to vanquish evil."


    override onCreated(character: Character) {
        character.classBar = new HolyPowerBar()

        const unsub = Game.eventBus.subscribe(characterDiedEvent, event => {
            if (character.classBar?.isFull() && character.classBar?.activated == false) {
                if (character.isEnemyTo(event.payload.character) || !event.payload.character.dead || event.payload.character.buffs.hasBuff(SavingGrace)) {
                    return
                }

                if (character.classBar instanceof HolyPowerBar) {
                    character.classBar.saveTarget(character, event.payload.character)
                }
            }
        })

        this.onDeletedCallbacks.push(unsub)
    }

    public skills = [
        new Smite(),
    ]

    possibleSkills = [
        new OverwhelmingLight(),
        new LayOnHands(),
        new BlessingOfProtection(),
        new Smite(),
        new BlessedWeapon(),
        new PrayerOfHealing(),
        new HammerOfJustice(),
        new DivineJudgement(),
    ]
}

export class HolyShock extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Holy Shock",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ANY,
        damageType: DamageType.MAGICAL,
        castTime: 750,
        imagePath: "/paladin/holy-shock.png",
        healing: new DynamicSkillDataValue(2).modifiedBaseBy('intelligence', 0.7),
        damage: new DynamicSkillDataValue(2).modifiedBaseBy('intelligence', 0.8),
        range: SkillRange.RANGED,
    })

    description: string | null = "Basic. Deal {damage} damage to an enemy or restore {healing} health to an ally."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.isEnemyTo(target)) {
                castBy.dealDamageTo({ amount: this.skillData.damage.value, targets: [target], type: DamageType.MAGICAL})
            } else {
                target.restoreHealth(this.skillData.healing.value, castBy, 1.0)
            }

            if (castBy.classBar != null) {
                let holyPowerAmount = 8

                if (target.id == castBy.id) {
                    holyPowerAmount += 3
                }

                castBy.classBar.increase(holyPowerAmount)
            }
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class HolyStrike extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Holy Strike",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 500,
        imagePath: "/paladin/holy-strike.png",
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(2).modifiedBaseBy('strength', 0.65),
    })

    description: string | null = "Basic. Deal {damage} damage to an enemy and restore half of the actual damage dealt to the lowest health ally."

    castSkill(castBy: Character, targets: Character[]): void {
        const results = castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: this.skillData.damageType, threatModifier: 1.1 })

        for (const result of results) {
            const battle = Game.currentBattle

            if (battle) {
                const alliesSortedByLowHealth = battle.combatants.filter((c) => !c.isEnemyTo(castBy) && !c.dead).sort((c1, c2) => Math.sign(c1.healthBar.current - c2.healthBar.current))
                
                let healing = Math.floor(result.actualDamage / 2)

                if (this.hasGem(FinishingStrikeSkilGem) && result.character.dead) {
                    healing *= 3
                }

                if (alliesSortedByLowHealth[0]) {
                    alliesSortedByLowHealth[0].restoreHealth(healing, castBy, 0.8)
                }
            }

            if (castBy.classBar != null) {
                castBy.classBar.increase(8)
            }
        }
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class OverwhelmingLight extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Overwhelming Light",
        energyCost: 5,
        cooldown: 7 * 1000,
        targetType: TargetType.TARGET_ANY,
        damageType: DamageType.MAGICAL,
        castTime: 1000,
        imagePath: "/paladin/overwhelming-light.png",
        damage: new DynamicSkillDataValue(4).modifiedBaseBy('intelligence', 0.9),
        range: SkillRange.RANGED,
    })

    description: string | null = "Deal {damage} damage to any target, if they survive, heal them for double the amount."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (this.hasGem(OverwhelmingMartyrdom)) {
                castBy.dealDamageTo({ amount: this.skillData.damage.value, type: DamageType.MAGICAL, targets: [castBy], threatModifier: 0, noCrit: true })
            } else {
                castBy.dealDamageTo({ amount: this.skillData.damage.value, type: DamageType.MAGICAL, targets: [target], threatModifier: 0, noCrit: true })
            }

            target.restoreHealth(this.skillData.damage.value * 2, castBy, 0.6)
        })

        if (castBy.classBar != null) {
            castBy.classBar.increase(10)
        }
    }

    override getCastPriority(castBy: Character, target: Character) {
        if (castBy.isEnemyTo(target) && (target.healthBar.current < this.skillData.damage.value || this.hasGem(OverwhelmingMartyrdom))) {
            return -50
        }

        if (!castBy.isEnemyTo(target) && target.healthBar.current > this.skillData.damage.value) {
            return -50
        }

        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class Smite extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Smite",
        energyCost: 4,
        cooldown: 5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.MAGICAL,
        castTime: 1000,
        imagePath: "/paladin/smite.png",
        damage: new DynamicSkillDataValue(4).modifiedBaseBy('intelligence', 0.7),
        healing: new DynamicSkillDataValue(1).modifiedBaseBy('intelligence', 0.3),
        buffDuration: 6 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Smite an enemy, dealing {damage} magic damage and marking them. For a duration each ally restores {healing} health when they attack it."

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.classBar) {
            castBy.classBar.increase(12)
        }

        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: this.skillData.damageType })

        targets.forEach((target) => {
          
            target.addBuff(new SmittenBuff({
                duration: this.skillData.buffDuration,
                healing: this.skillData.healing.value,
                branding: this.hasGem(BrandingSmiteSkillGem)
            }), castBy)
        })
    }
}

export class BlessingOfProtection extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Blessing of Protection",
        energyCost: 3,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 250,
        damageType: DamageType.MAGICAL,
        imagePath: "/paladin/blessing-of-protection.png",
        buffDuration: 8 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Buff an ally to give them +30% armor for a duration"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => { 
            target.addBuff(new BlessingOfProtectionBuff(this.skillData.buffDuration), castBy)
            Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 8}))
            Game.eventBus.publish(globalThreatEvent({ healer: castBy, amount: 4}))
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 10
    }
}

export class LayOnHands extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Lay on Hands",
        energyCost: 0,
        cooldown: 20 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        damageType: DamageType.MAGICAL,
        castTime: 500,
        imagePath: "/paladin/lay-on-hands.png",
        range: SkillRange.RANGED,
        healing: new DynamicSkillDataValue(1).modifiedBaseBy('intelligence', 0.15)
    })

    description: string | null = "Spend all your energy to heal an ally for the energy spent × {healing}"

    canCast(castBy: Character): boolean {
        if (castBy.energyBar.current == 0) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            const consumeAmount = castBy.energyBar.current
            
            target.restoreHealth(consumeAmount * this.skillData.healing.value, castBy, 0)

            if (this.hasGem(RejuvenatingLight)) {
                target.energyBar.increase(2)
            }

            if (castBy.classBar != null) {
                castBy.classBar.increase(consumeAmount * 3)
            }

            castBy.energyBar.decrease(consumeAmount)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        const targetHealthPercentage = target.healthBar.current / target.healthBar.max;

        if (targetHealthPercentage < 0.5 && castBy.energyBar.current < 5) {
            return 25
        }

        if (targetHealthPercentage < 0.3 && castBy.energyBar.current > 3) {
            return 25
        }

        return 0
    }
}

export class BlessedWeapon extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Blessed Weapon",
        energyCost: 2,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        damageType: DamageType.MAGICAL,
        castTime: 500,
        imagePath: "/paladin/blessed-weapon.png",
        buffDuration: 10 * 1000,
        range: SkillRange.RANGED,
        damage: new DynamicSkillDataValue(0).modifiedBaseBy('intelligence', 0.25)
    })

    description: string | null = "Buff an ally to add {damage} damage to their physical attacks and turns it into magic damage"

    canCast(castBy: Character): boolean {
        if (castBy.energyBar.current == 0) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new BlessedWeaponBuff({
                duration: this.skillData.buffDuration,
                damageAmount: this.hasGem(WeaponOfRightenousnessSkillGem) ? (this.skillData.damage.value * 2) : this.skillData.damage.value
            }), castBy)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 15;
    }
}


export class PrayerOfHealing extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Prayer of Healing",
        energyCost: 6,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ALL_FRIENDLIES,
        damageType: DamageType.MAGICAL,
        castTime: 1250,
        imagePath: "/paladin/prayer-of-healing.png",
        healing: new DynamicSkillDataValue(3).modifiedBaseBy('intelligence', 0.7),
        range: SkillRange.RANGED,
    })

    description: string | null = "Restore {healing} health to all allies."

    canCast(castBy: Character): boolean {
        if (castBy.energyBar.current == 0) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(this.skillData.healing.value, castBy, 0.8)
        })

        if (castBy.classBar) {
            castBy.classBar.increase(targets.length * 4)
        }
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 15;
    }
}

export class HammerOfJustice extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Hammer of Justice",
        energyCost: 5,
        cooldown: 10 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        imagePath: "/paladin/hammer-of-justice.png",
        range: SkillRange.MELEE,
        buffDuration: 6 * 1000,
        damage: new DynamicSkillDataValue(2).modifiedBaseBy('intelligence', 0.4).modifiedBaseBy('strength', 0.5),
        strengthDamageModifier: 0.5,
    })

    description: string | null = "Deal {damage} damage to an enemy and mark them for a duration. After the buff ends, stun the enemy based on how much damage you dealt to it."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: this.skillData.damageType, threatModifier: 1.1 })

        for (const target of targets) {
            castBy.classBar?.increase(7)
            target.addBuff(new HammerOfJusticeBuff({
                duration: this.skillData.buffDuration,
                msPerDamageDealt: 100,
                exposes: this.hasGem(HammerOfVengeanceSkillGem),
                healsOnExpire: this.hasGem(HammerOfRestorationSkillGem),
                countsAllies: this.hasGem(HammerOfRetributionSkillGem)
            }), castBy)
        }
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class DivineJudgement extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Divine Judgement",
        energyCost: 3,
        cooldown: 14 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        imagePath: "/paladin/divine-judgement.png",
        range: SkillRange.MELEE,
        buffDuration: 4 * 1000,
        damage: new DynamicSkillDataValue(2).modifiedBaseBy('intelligence', 0.2).modifiedBaseBy('strength', 0.7),
        strengthDamageModifier: 0.6,
    })

    description: string | null = "Call a divine judgement on an enemy, after a duration, deal {damage} physical piercing damage to them."

    castSkill(castBy: Character, targets: Character[]): void {
        for (const target of targets) {
            target.addBuff(new DivineJudgementBuff({
                duration: this.skillData.buffDuration,
                damage: this.skillData.damage.value,
                damageType: this.skillData.damageType
            }), castBy)
        }
    }
}