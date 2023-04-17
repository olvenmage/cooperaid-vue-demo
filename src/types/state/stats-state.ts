export default interface StatsState {
    maxHealth: number
    armor: number // reduces phys dmg flat,
    magicalArmor: number // reduces mag dmg flat,
    speed: number, // increases cast speed
    energyBoost: number // increases energy regen
    stunned: boolean
}
