export default interface ExpGainedState {
    oldLevel: {
        level: number
        currentExp: number
        maxExp: number
    }
    newLevel: {
        level: number
        currentExp: number
        maxExp: number
    }
    levelsGained: number,
    expGained: number,
    statPointsGained: number
}
