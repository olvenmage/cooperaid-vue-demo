import type Character from '../character'
import Skill, { TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import Enrage from '../buffs/enrage';
import DamageType from '../damage-type';


export default class Guardian extends PlayerIdentity {
    public name = "Guardian"
    public maxHealth = 50
    public imagePath = "/src/assets/classes/guardian.png"
    public playerClass = PlayerClass.GUARDIAN
    public armor = 3

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'silver')
    }

    public skills = [
        new MockingBlow(),
    ]
}

class MockingBlow extends Skill {
    name: string = "Mocking Blow";
    energyCost: number = 2;
    cooldown: number = 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(4, castBy, DamageType.PHYSICAL, 3))
    }
}

