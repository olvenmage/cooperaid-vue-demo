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
        attackDamagePerStrength: 4,

        // CONST
        hardinessPerConst: 1,
        constPerArmor: 6,
        maxHealthPerConst: 3,

        // INT
        cooldownReductionPerInt: 1,
        intPerMagicArmor: 6,
        intPerMaxEnergyIncrease: 6
    }

    static exp = {
        // affecting the amount of XP (lower values = more XP required per level) (X)
        expAmountFactor: 0.2,

        // how quickly the required xp per level should increase (higher values = larger gaps between levels) (Y)
        expIncreaseFactor: 2.5
    }
}