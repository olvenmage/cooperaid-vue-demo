
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';

export default class DragonBoss extends Identity {
    public name = "Dragon"
    public maxHealth = 400
    public imagePath = "/src/assets/dragonboss.png"
    public armor = 3

    public stackingFireDamage = 0

    public skills = [
        new DragonThrash(),
        new DragonSwipe(),
        new DragonRoar(),
        new FireBreath()
    ]
}

class DragonThrash extends Skill {
    name: string = "Thrash"
    energyCost: number = 3;
    cooldown: number = 0;
    castTime = 4000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(12, castBy, DamageType.PHYSICAL))
    }
}

class DragonSwipe extends Skill {
    name: string = "Swipe"
    energyCost: number = 6;
    cooldown: number = 8 * 1000;
    castTime = 2000;
    targetType: TargetType = TargetType.TARGET_ALL_ENEMIES

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(10, castBy, DamageType.PHYSICAL))
    }
}

class DragonRoar extends Skill {
    name: string = "Roar"
    energyCost: number = 0;
    cooldown: number = 15 * 1000;
    castTime = 1000;
    targetType: TargetType = TargetType.TARGET_FRIENDLY

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.identity instanceof DragonBoss) {
            castBy.energyBar.energyRegenAmount += 25
            castBy.identity.stackingFireDamage += 2
        }
    }
}


class FireBreath extends Skill {
    name: string = "Fire Breath"
    energyCost: number = 10;
    castTime = 4000;
    cooldown: number = 4 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        const dragonIdentity = castBy.identity
        if (dragonIdentity instanceof DragonBoss) {
            targets.forEach((target) => {
                target.takeDamage(randomRange(16, 18 + dragonIdentity.stackingFireDamage), castBy, DamageType.MAGICAL)
                target.addBuff(new MeltedArmorBuff())
            })
        }
       
    }
}