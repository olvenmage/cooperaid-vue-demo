import type Enemy from "@/types/enemy";
import Game from "./game";
import GemLootProvider from "@/types/skill-upgrades/gem-loot-provider";
import type Reward from "@/types/reward/reward";

export default abstract class Encounter {
    abstract startEncounter(): Promise<EncounterFinishedResponse>
}

export interface EncounterFinishedResponse {
    gameover: boolean,
    startNextEncounter: boolean
}

export class CombatEncounter extends Encounter {
    constructor(private enemies: Enemy[]) {
        super()
    }

    async startEncounter(): Promise<EncounterFinishedResponse> {
        const result = await Game.startCombat(this.enemies)

        return new Promise((resolve, reject) => {
            if (!result.playersWon) {
                setTimeout(() => {
                    Game.gameover()
                }, 2000)
            }

            Game.exitCombat()

            resolve({
                gameover: !result.playersWon,
                startNextEncounter: true
            })
        })
    }
}

export class RewardEncounter extends Encounter {
    constructor() {
        super()
    }

    async startEncounter(): Promise<EncounterFinishedResponse> {
        await Game.handoutRewards()

        return new Promise((resolve, reject) => {
            resolve({
                startNextEncounter: false,
                gameover: false
            })
        })
    }
}

export class ShopEncounter extends Encounter {
    constructor(private items: any[]) {
        super()
    }

    async startEncounter(): Promise<EncounterFinishedResponse> {
        await Game.enterShop()

        return new Promise((resolve, reject) => {
            resolve({
                startNextEncounter: false,
                gameover: false
            })
        })
    }
}

export class TestEncounter extends Encounter {
    constructor() {
        super()
    }

    async startEncounter(): Promise<EncounterFinishedResponse> {
        for (const player of Game.players.value) {
            console.log(GemLootProvider.getUpgradeGemOptions(player as Player))
        }

        return new Promise((resolve, reject) => {
            resolve({ gameover: false, startNextEncounter: true })
        })
    }
}