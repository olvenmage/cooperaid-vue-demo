import { CombatEncounter, ShopEncounter } from "@/core/encounter";
import Game from "@/core/game";
import TrainingDummy from "@/types/enemies/training-dummy";

import Enemy from "@/types/enemy";
import type Identity from "@/types/identity";
import Player from "@/types/player";

export default function testClassSetup(playerClass: any, amount: number = 1) {
    const dummies: Enemy[] = []

    for (let i = 0; i < amount; i++) {
      dummies.push(
        new Enemy(new TrainingDummy())
      )
    }
    Game.startGame({
        players: [
            new Player(new (playerClass as any)()),
        ],
        route: [
          new CombatEncounter(dummies),
          new ShopEncounter([])
        ]
    })
}