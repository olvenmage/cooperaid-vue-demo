import Character from './character';
import type Identity from './identity';
import { reactive } from 'vue'
import type ClassBar from './class-bar';
import CharacterStats from './character-stats';
import GameSettings from '@/core/settings';

class Enemy {
    private aiEnabled = true
    classBar: ClassBar|null

    constructor(private identity: Identity) {
        this.classBar = identity.classBar
    }

    enableAI(): this {
        this.aiEnabled = true
        return this
    }

    createCharacter(): Character {
        const stats = new CharacterStats(this.identity.baseStats.clone())
        
        const character = reactive(new Character(this.identity, false, null, null)) as Character

        if (this.aiEnabled) {
            character.enableAI()
        }

        character.identity.onCreated(character)
        character.checkDeath()

        return character
    }
}

export default Enemy;