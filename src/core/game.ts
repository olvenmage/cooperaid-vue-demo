import type Enemy from "@/types/enemy";
import type Player from "@/types/player";
import Battle from "./battle";

export default abstract class Game {
    static currentBattle: Battle|null = null

    static startCombat(
        players: Player[],
        enemies: Enemy[]
    ) {
        if (this.currentBattle != null) {
            throw new Error("Can't start combat with existing combat still going")
        }

        this.currentBattle = new Battle(players, enemies);
        this.currentBattle.startCombat()
    }

    static stopCombat() {
        if (this.currentBattle == null) {
            throw new Error("Can't stop combat without existing combat still going")
        }

        this.currentBattle.stopCombat()
        this.currentBattle = null
    }
}