import { CombatEncounter, ShopEncounter } from "@/core/encounter";
import Game from "@/core/game";
import DragonBoss from "@/types/enemies/dragon-boss";
import DragonEgg from "@/types/enemies/dragon-egg";
import Enemy from "@/types/enemy";
import type Player from "@/types/player";

export default function dragonBossSetup(...players: Player[]) {
    Game.startGame({
        players,
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