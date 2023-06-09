
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';

export default class TrainingDummy extends Identity {
    public name = "Training Dummy"
    public baseStats = new CoreStats({
        constitution: 10,
        strength: 10,
        dexterity: 10,
        intelligence: 10
    })
    public imagePath = "/enemies/training-dummy.png"

    public skills = []
}