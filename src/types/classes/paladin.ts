import type Character from '../character'
import Skill, { TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import Game from '@/core/game';
import { characterDiedEvent, globalThreatEvent } from '@/core/events';
import SavingGrace from '../buffs/saving-grace';
import BlessingOfProtectionBuff from '../buffs/blessing-of-protection'
import SmittenBuff from '../buffs/smitten';
import CharacterStats from '../character-stats';


export default class Paladin extends PlayerIdentity {
    public name = "Paladin"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: 2, magicalArmor: 1 })
    public imagePath = "/classes/paladin.png"
    public playerClass = PlayerClass.PALADIN
    public basicSkill: Skill = new HolyShock()
    public color = "#B59E54";

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'gold')

        Game.eventBus.subscribe(characterDiedEvent, event => {
            if (character.classBar?.isFull() && character.classBar?.activated == false) {
                if (character.isEnemyTo(event.payload.character) || !event.payload.character.dead || event.payload.character.buffs.hasBuff(SavingGrace)) {
                    return
                }

                character.classBar.activated = true
                event.payload.character.dead = false
                event.payload.character.addBuff(new SavingGrace(), character)
                event.payload.character.healthBar.current = 1
            }
           
        })
    }

    public skills = [
        new Smite(),
        new BlessingOfProtection()
    ]
}

export class HolyShock extends Skill {
    name: string = "Holy Shock";
    energyCost: number = 2;
    cooldown: number = 0;
    castTime = 1750
    targetType: TargetType = TargetType.TARGET_ANY
    imagePath = "/paladin/holy-shock.png"


    DAMAGE_AMOUNT = 6
    HEAL_AMOUNT = 5

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.isEnemyTo(target)) {
                castBy.dealDamageTo({ amount: this.DAMAGE_AMOUNT, target, type: DamageType.MAGICAL})
            } else {
                target.restoreHealth(this.HEAL_AMOUNT, castBy, 1.0)
            }

            if (castBy.classBar != null) {
                let holyPowerAmount = 9

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

export class OverwhelmingLight extends Skill {
    name: string = "Overwhelming Light";
    energyCost: number = 5;
    cooldown: number = 8 * 1000;
    castTime = 2000
    targetType: TargetType = TargetType.TARGET_ANY
    imagePath = "/paladin/overwhelming-light.png"

    DAMAGE_AMOUNT = 10
    HEAL_AMOUNT = 20

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: this.DAMAGE_AMOUNT, type: DamageType.MAGICAL, target})
            target.restoreHealth(this.HEAL_AMOUNT, castBy, 0.8)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        if (!castBy.isEnemyTo(target) && target.healthBar.current < this.DAMAGE_AMOUNT) {
            return -50
        }

        if (!castBy.isEnemyTo(target) && target.healthBar.current > this.DAMAGE_AMOUNT) {
            return -50
        }

        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class Smite extends Skill {
    name: string = "Smite";
    energyCost: number = 5;
    cooldown: number = 5 * 1000;
    castTime = 2000
    targetType: TargetType = TargetType.TARGET_ENEMY
    imagePath = "/paladin/smite.png"

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.classBar) {
            castBy.classBar.increase(12)
        }
   
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 10, target, type: DamageType.MAGICAL})
            target.addBuff(new SmittenBuff(), castBy)
        })
    }
}

export class BlessingOfProtection extends Skill {
    name: string = "Blessing of Protection";
    energyCost: number = 3;
    cooldown: number = 12 * 1000;
    castTime = 500
    targetType: TargetType = TargetType.TARGET_FRIENDLY
    imagePath = "/paladin/blessing-of-protection.png"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => { 
            target.addBuff(new BlessingOfProtectionBuff(), castBy)
            Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 15}))
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 10
    }
}