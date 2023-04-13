import type Buff from "./buff";
import type CharacterStats from "./character-stats";

interface StatMutatingBuff {
    mutateStats(stats: CharacterStats) : CharacterStats
}

const isStatMutatingBuff = (buff: any): buff is StatMutatingBuff => {
    return (buff as any).mutateStats != undefined
} 

export default StatMutatingBuff
export { isStatMutatingBuff }