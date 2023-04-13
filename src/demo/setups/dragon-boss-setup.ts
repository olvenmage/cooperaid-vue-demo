import { CombatEncounter, ShopEncounter } from "@/core/encounter";
import Game from "@/core/game";
import Barbarian from "@/types/classes/barbarian";
import Juggernaut from "@/types/classes/juggernaut";
import Mage from "@/types/classes/mage";
import Paladin from "@/types/classes/paladin";
import Rogue from "@/types/classes/rogue";
import DragonBoss from "@/types/enemies/dragon-boss";
import DragonEgg from "@/types/enemies/dragon-egg";
import Enemy from "@/types/enemy";
import Player from "@/types/player";
import Taunt from "@/types/skills/taunt";

export default function dragonBossSetup() {
    Game.startGame({
        players: [
            new Player(new Paladin()).enableAI(),
            new Player(new Juggernaut()).enableAI(),
            new Player(new Rogue()).enableAI(),
            new Player(new Mage())
        ],
        route: [
          new CombatEncounter([
            new Enemy(new DragonEgg()),
            new Enemy(new DragonBoss()),
            new Enemy(new DragonEgg()),
          ]),
          new ShopEncounter([])
        ]
    })
}