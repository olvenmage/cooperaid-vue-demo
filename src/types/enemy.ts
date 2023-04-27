import Character from './character';
import type Identity from './identity';
import { reactive } from 'vue'
import type ClassBar from './class-bar';

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
        const character = reactive(new Character(this.identity, false)) as Character

        if (this.aiEnabled) {
            character.enableAI()
        }

        character.identity.onCreated(character)
        character.checkDeath()

        return character
    }
}

export default Enemy;