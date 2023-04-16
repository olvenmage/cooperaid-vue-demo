import Character from './character';
import CharacterAI from './character-ai';
import Faction from './faction';
import type Identity from './identity';
import type PlayerIdentity from './player-identity';
import type Skill from './skill';
import type PlayerState from './state/player-state';
import { reactive } from 'vue'

abstract class PlayerNumberRegistry {
    static currentPlayerIndex = 0
    static playerColors = [
        '#F52E2e',
        '#5463FF',
        '#FFC717',
        '#1F9E40',
        '#24D4C4',
        '#D41CE5',
        '#4A4559',
        '#FFBF00'
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

class Player {
    public playerColor: string
    public playerNumber: number

    private aiEnabled = false

    public combatCharacter: Character|null = null
    public skills: Skill[] = []

    private innerPlayerClass: PlayerIdentity|null = null

    get playerClass() {
        return this.innerPlayerClass
    }

    set playerClass(newVal: PlayerIdentity|null) {
        this.innerPlayerClass = newVal
        if (newVal) {
            this.skills = [
                newVal.basicSkill,
                ...newVal.skills
            ]
        } else {
            this.skills = [];
        }
      
    }

    constructor(public readonly id: string, public readonly name: string, public controledExternally: boolean, playerClass: PlayerIdentity|null) {
        
        this.playerNumber = PlayerNumberRegistry.getNumber()
        this.playerColor = PlayerNumberRegistry.getColor(this.playerNumber)

        if (playerClass) {
            this.setClass(playerClass)
        }
    }

    setClass(playerClass: PlayerIdentity) {
        this.playerClass = playerClass
        this.skills = playerClass.skills
    }
    
    enableAI(): this {
        this.aiEnabled = true
        return this
    }

    createCharacter(): Character {
        if (!this.playerClass) {
            throw Error("Can't create character without player identity")
        }

        const character = reactive(new Character(this.playerClass, true)) as Character

        character.id = this.id

        character.player = this

        this.combatCharacter = character

        if (this.aiEnabled) {
            character.enableAI()
        }

        character.identity.onCreated(character)

        return character
    }

    getState(): PlayerState {
        return {
            id: this.id,
            name: this.name,
            playerClass: this.playerClass?.getState() || null
        }
    }

    removeCharacter() {
        this.combatCharacter = null 
    }
}

export default Player;