
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';
import CharacterStats from '../character-stats';

export default class DragonBoss extends Identity {
    public name = "Dragon"
    public baseStats = CharacterStats.fromObject({ maxHealth: 400, armor: 3, magicalArmor: 2 })
    public imagePath = "/enemies/dragon/dragonboss.png"

    public stackingFireDamage = 0

    public skills = [
        new DragonThrash(),
        new DragonSwipe(),
        new DragonRoar(),
        new FireBreath()
    ]
}

export class DragonThrash extends Skill {
    name: string = "Thrash"
    energyCost: number = 3;
    cooldown: number = 0;
    castTime = 3 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 12, target, type: DamageType.PHYSICAL }))
    }
}

export class DragonSwipe extends Skill {
    name: string = "Swipe"
    energyCost: number = 5;
    cooldown: number = 10 * 1000;
    castTime = 2 * 1000;
    targetType: TargetType = TargetType.TARGET_ALL_ENEMIES

    castSkill(castBy: Character, targets: Character[]): void {

        console.log("SWIPE!")
        console.log(targets)
        targets.forEach((target) => castBy.dealDamageTo({ amount: 12, target, type: DamageType.PHYSICAL }))
    }
}

export class DragonRoar extends Skill {
    name: string = "Roar"
    energyCost: number = 0;
    cooldown: number = 15 * 1000;
    castTime = 1 * 1000;
    targetType: TargetType = TargetType.TARGET_FRIENDLY

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.identity instanceof DragonBoss) {
            castBy.skills.forEach((skill) => skill.castTime = Math.max(skill.castTime - 200, 0))
            castBy.energyBar.energyRegenAmount += 25
            castBy.identity.stackingFireDamage += 2
        }
    }
}


export class FireBreath extends Skill {
    name: string = "Fire Breath"
    energyCost: number = 10;
    castTime = 4 * 1000;
    cooldown: number = 4 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        const dragonIdentity = castBy.identity
        if (dragonIdentity instanceof DragonBoss) {
            targets.forEach((target) => {
                castBy.dealDamageTo({
                    amount: randomRange(16, 18 + dragonIdentity.stackingFireDamage),
                    target,
                    type: DamageType.MAGICAL
                })

                target.addBuff(new MeltedArmorBuff(), castBy)
            })
        }
       
    }
}