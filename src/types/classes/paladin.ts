import type Character from '../character'
import Skill, { TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import Game from '@/core/game';
import { characterDiedEvent } from '@/core/events';
import SavingGrace from '../buffs/saving-grace';
import BlessingOfProtectionBuff from '../buffs/blessing-of-protection'
import SmittenBuff from '../buffs/smitten';
import CharacterStats from '../character-stats';


export default class Paladin extends PlayerIdentity {
    public name = "Paladin"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: 3})
    public imagePath = "/src/assets/classes/paladin.png"
    public playerClass = PlayerClass.PALADIN

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
        new HolyShock(),
        new Smite(),
        new BlessingOfProtection()
    ]
}

class HolyShock extends Skill {
    name: string = "Holy Shock";
    energyCost: number = 2;
    cooldown: number = 0;
    castTime = 1750
    targetType: TargetType = TargetType.TARGET_ANY


    DAMAGE_AMOUNT = 6
    HEAL_AMOUNT = 5

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.isEnemyTo(target)) {
                target.takeDamage(this.DAMAGE_AMOUNT, castBy, DamageType.MAGICAL, 1.0)
            } else {
                target.restoreHealth(this.HEAL_AMOUNT, castBy, 1.0)
            }

            if (castBy.classBar != null) {
                castBy.classBar.increase(10)
            }
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return Math.max(((target.healthBar.max - target.healthBar.current) - this.HEAL_AMOUNT) + 1, 5)
    }
}

class Smite extends Skill {
    name: string = "Smite";
    energyCost: number = 5;
    cooldown: number = 5 * 1000;
    castTime = 2000
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.classBar) {
            castBy.classBar.increase(12)
        }
   
        targets.forEach((target) => {
            target.takeDamage(10, castBy, DamageType.MAGICAL)
            target.addBuff(new SmittenBuff())
        })
    }
}

class BlessingOfProtection extends Skill {
    name: string = "Blessing of Protection";
    energyCost: number = 4;
    cooldown: number = 12 * 1000;
    castTime = 500
    targetType: TargetType = TargetType.TARGET_FRIENDLY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.addBuff(new BlessingOfProtectionBuff(), castBy))
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 10
    }
}