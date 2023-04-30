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

const soloRoute: Encounter[] = [
    new CombatEncounter([
      new Enemy(new Goblin()),
    ], 500, 50),
    new ShopEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new RewardEncounter(),
    new CombatEncounter([
      new Enemy(new DragonBoss()),
    ], 30),
    new CombatEncounter([
      new Enemy(new DragonBoss()),
    ], 30),
  
]

export default soloRoute