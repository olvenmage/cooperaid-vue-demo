export default interface StatConfigState {
    // DEX
    eneryRegenPerDex: number,
    dexPerCrit: number,
    dexPerDodge: number,

    // STR
    castSpeedIncreasePerStr: number,
    attackDamagePerStrength: number,

    // CONST
    hardinessPerConst: number,
    constPerArmor: number,
    maxHealthPerConst: number,

    // INT
    cooldownReductionPerInt: number,
    intPerMagicArmor: number,
    intPerMaxEnergyIncrease: number
}