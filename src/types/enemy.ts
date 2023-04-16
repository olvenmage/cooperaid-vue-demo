import Character from './character';
import CharacterAI from './character-ai';
import Faction from './faction';
import type Identity from './identity';

class Enemy extends Character {
    constructor(identity: Identity) {
        super(identity, false)
        this.classBar = identity.classBar
        this.ai = new CharacterAI(identity)
    }
}

export default Enemy;