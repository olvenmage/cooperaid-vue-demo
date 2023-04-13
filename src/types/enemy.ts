import Character from './character';
import Faction from './faction';
import type Identity from './identity';

class Enemy extends Character {
    constructor(identity: Identity) {
        super(identity, [Faction.ENEMIES])
        this.classBar = identity.classBar
    }
}

export default Enemy;