import Identity from './identity'
import type ClassBar from './class-bar'

enum PlayerClass {
    BARBARIAN = 0,
    GUARDIAN = 1,
    PRIEST = 2,
    PALADIN = 3,
    DISRUPTOR = 4,
    DEADEYE = 5
}

abstract class PlayerIdentity extends Identity {
    abstract playerClass: PlayerClass
    public classBar: ClassBar|null = null
}

export default PlayerIdentity;

export { PlayerClass }