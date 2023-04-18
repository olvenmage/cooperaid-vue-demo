import type Enemy from "@/types/enemy";
import Game from "./game";
import SkillDamageUpgrade from "@/types/skill-upgrades/skill-damage-upgrade";

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
                setTimeout(() => {
                    Game.gameover()
                }, 2000)
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

export class TestEncounter extends Encounter {
    constructor() {
        super()
    }

    async startEncounter(): Promise<boolean> {
        const dmgUpgrade = new SkillDamageUpgrade()

        for (const player of Game.players.value) {
            if (player.basicSkill != null && dmgUpgrade.applies(player.basicSkill)) {
                console.log("applies!")
                player.basicSkill.socketedUpgrade = dmgUpgrade
            }
        }

        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
}