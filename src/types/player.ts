import Character from './character';
import CharacterAI from './character-ai';
import Faction from './faction';
import type Identity from './identity';
import type PlayerIdentity from './player-identity';

abstract class PlayerNumberRegistry {
    static currentPlayerIndex = 0
    static playerColors = [
        'red',
        'lightskyblue',
        'green',
        'purple',
        'brown',
        'teal',
        'pink'
    ]

    static getColor(num: number): string {
        return this.playerColors[num - 1]
    }

    static getNumber(): number {
        const num = this.currentPlayerIndex + 1
        this.currentPlayerIndex += 1

        return num 
    }
}

class Player extends Character {
    public playerColor: string
    public playerNumber: number

    constructor(playerIdentity: PlayerIdentity) {
        super(playerIdentity, [Faction.ALLIES])
        this.playerNumber = PlayerNumberRegistry.getNumber()
        this.playerColor = PlayerNumberRegistry.getColor(this.playerNumber)
        this.classBar = playerIdentity.classBar
    }
    
    enableAI(): this {
        this.ai = new CharacterAI(this.identity)
        return this
    }
}

export default Player;