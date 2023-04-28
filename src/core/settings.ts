import type StatConfigState from "@/types/state/stat-config-state"

export default abstract class GameSettings {
    // AI
    // To steal threat you need to have {threatStealBuffer} percent more threat than the current highest
    static threatStealBuffer = 0.20
    static aiInteractDelay = 1.0
    static aiEnabled = true


    // DIFFICULTY
    static baseHealth = 20
    static basePlayerCritChance = 3
    static speedFactor = 0.5
    static baseMonsterCritChance = 3
    static defaultEnergyRegenAmount = 100
    static startingEnergyPercentage = 0.5
    static generateEnergyWhileCasting = true
    static statPointsPerLevel = 4
    static extraEnemyHealthModifier = 1.0
    static derivedStatsOptions: StatConfigState = {
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
        expAmountFactor: 0.15,

        // how quickly the required xp per level should increase (higher values = larger gaps between levels) (Y)
        expIncreaseFactor: 2.5
    }
}