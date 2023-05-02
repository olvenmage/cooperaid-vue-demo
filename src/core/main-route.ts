import type Encounter from "./encounter";
import { CombatEncounter, RewardEncounter, ShopEncounter, TestEncounter } from '@/core/encounter';
import Enemy from '@/types/enemy';
import DragonBoss from '@/types/enemies/dragon-boss';
import DragonEgg from '@/types/enemies/dragon-egg';
import Goblin from '@/types/enemies/goblin';
import Gryphon from "@/types/enemies/gryphon";
import Barbarian from "@/types/classes/barbarian";
import Halbadier from "@/types/enemies/halbadier";
import Archer from "@/types/enemies/archer";
import Bandit from "@/types/enemies/bandit"
import Rogue from "@/types/classes/rogue";
import Paladin from "@/types/classes/paladin";
import pickRandom from "@/utils/pickRandom";
import type Identity from "@/types/identity";
import Healer from "@/types/enemies/healer";

const banditEncounter = new CombatEncounter([
  new Enemy(new Bandit()),
  new Enemy(new Bandit()),
  new Enemy(new Bandit()),
  new Enemy(new Bandit()),
], 9, 12)

const randomEmpire = () => {
  return pickRandom([new Halbadier(), new Archer(), new Healer()]) as Identity
}

const mainRoute: Encounter[] = [
    new CombatEncounter([
      new Enemy(new Goblin()),
      new Enemy(new Goblin()),
      new Enemy(new Goblin()),
      new Enemy(new Goblin()),
    ], 5, 10),
    new RewardEncounter(),
    banditEncounter,
    new RewardEncounter(),
    new CombatEncounter(
      [
        new Enemy(randomEmpire()),
        new Enemy(randomEmpire()),
        new Enemy(randomEmpire()),
        new Enemy(randomEmpire()),
      ], 14, 16
    ),
    new RewardEncounter(),
    new ShopEncounter(),
    new CombatEncounter(
      [
        new Enemy(new Gryphon()),
      ], 17, 16
    ),
    new RewardEncounter(),
    new CombatEncounter(
      [
        new Enemy(new Halbadier()),
        new Enemy(randomEmpire()),
        new Enemy(new Gryphon()),
        new Enemy(new Archer())
      ], 20, 20
    ),
    new RewardEncounter(),
    new ShopEncounter(),
    new CombatEncounter([
      new Enemy(new DragonEgg()),
      new Enemy(new DragonEgg()),
      new Enemy(new DragonBoss()),
      new Enemy(new DragonEgg()),
      new Enemy(new DragonEgg()),
    ], 30),
  
]

export default mainRoute