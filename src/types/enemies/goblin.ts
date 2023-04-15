
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';

export default class Goblin extends Identity {
    public name = "Goblin"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: 1 })
    public imagePath = "/enemies/goblin.png"

    public skills = [
        new GoblinBite(),
        new GoblinClobber()
    ]
}

class GoblinClobber extends Skill {
    name: string = "Clobber"
    energyCost: number = 8;
    cooldown: number = 10 * 1000;
    castTime = 8000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 14, target, type: DamageType.PHYSICAL }))
    }
}


class GoblinBite extends Skill {
    name: string = "Bite"
    energyCost: number = 3;
    castTime = 4000;
    cooldown: number = 0;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 5, target, type: DamageType.PHYSICAL }))
    }
}