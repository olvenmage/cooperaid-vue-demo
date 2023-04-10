
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';

export default class Goblin extends Identity {
    public name = "Goblin"
    public maxHealth = 40
    public imagePath = "/src/assets/goblin.png"
    public armor = 1

    public skills = [
        new GoblinBite(),
        new GoblinClobber()
    ]
}

class GoblinClobber extends Skill {
    name: string = "Clobber"
    energyCost: number = 8;
    cooldown: number = 10 * 1000;
    castTime = 3000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(14, castBy, DamageType.PHYSICAL))
    }
}


class GoblinBite extends Skill {
    name: string = "Bite"
    energyCost: number = 3;
    castTime = 5000;
    cooldown: number = 0;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(4, castBy, DamageType.PHYSICAL))
    }
}