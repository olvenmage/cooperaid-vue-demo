import type Enemy from "@/types/enemy";
import Game from "./game";

export default abstract class Encounter {
    abstract startEncounter(): Promise<boolean>
}

export class CombatEncounter extends Encounter {
    constructor(private enemies: Enemy[]) {
        super()
    }

    async startEncounter(): Promise<boolean> {
        const result = await Game.startCombat(this.enemies)

        return new Promise((resolve, reject) => {
            if (!result.playersWon) {
                Game.gameover()
            }

            resolve(result.playersWon)
        })
    }
}

export class ShopEncounter extends Encounter {
    constructor(private items: any[]) {
        super()
    }

    async startEncounter(): Promise<boolean> {
        await Game.enterShop()

        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
}