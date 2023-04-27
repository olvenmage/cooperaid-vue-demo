export default abstract class GameSettings {
    static defaultEnergyRegenAmount = 100
    static speedFactor = 0.5
    static startingEnergyPercentage = 0.5
    static aiInteractDelay = 1.0
    static generateEnergyWhileCasting = true
    static aiEnabled = true

    static threatStealBuffer = 0.20
    static baseHealth = 20
    static baseCritChance = 3

    static derivedStatsOptions = {
        // DEX
        eneryRegenPerDex: 1,
        dexPerCrit: 3,
        dexPerDodge: 3,

        // STR
        castSpeedIncreasePerStr: 1,
        attackPowerPerStrength: 4,

        // CONST
        hardinessPerConst: 1,
        constPerArmor: 6,
        maxHealthPerConst: 3,

        // INT
        cooldownReductionPerInt: 1,
        intPerMagicArmor: 6,
        intPerMaxEnergyIncrease: 6
    }
}