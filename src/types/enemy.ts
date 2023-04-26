import Character from './character';
import ThreatTable from './threat-table';
import Faction from './faction';
import type Identity from './identity';

class Enemy extends Character {
    constructor(identity: Identity) {
        super(identity, false)
        this.classBar = identity.classBar
        this.threat = new ThreatTable()
    }
}

export default Enemy;