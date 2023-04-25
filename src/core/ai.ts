import type Character from "@/types/character";
import Skill, { AiTargetting, TargetType } from "@/types/skill";
import pickRandom from "@/utils/pickRandom";
import shuffleArray from "@/utils/shuffleArray";
import type Battle from "./battle";

export default class CharacterAIBrain {
    static act(character: Character, battle: Battle) {
        if (character.ai == null) {
            return
        }

        if (!character.actionable) {
            return
        }

        this.castBestSkill(character, battle)
    }

    private static castBestSkill(character: Character, battle: Battle): void {
        const skills = shuffleArray(character.skills)

        let bestSkill: Skill|null = null

        for (const skill of skills) {
            if (skill.onCooldown) {
                continue
            }
            
            if (skill.skillData.energyCost > character.energyBar.current) {
                // sometimes save energy for expensive skill
                if (Math.round(Math.random())) {
                    return
                }

                continue
            }
            
            if (!skill.canCast(character)) {
                continue
            }

            // prioritize expensive skills
            if (bestSkill == null || skill.skillData.energyCost > bestSkill.skillData.energyCost) {
                bestSkill = skill
            }
        }

        if (bestSkill == null) {
            return
        }

        if (bestSkill.skillData.targetType == TargetType.TARGET_NONE) {
            bestSkill.cast(character, () => [])
            return
        }

        if (bestSkill.skillData.targetType == TargetType.TARGET_SELF) {
            const self = character
            bestSkill.cast(character, () => [self])
            return
        }

        if (bestSkill.skillData.targetType == TargetType.TARGET_ALL_ENEMIES) {
            bestSkill.cast(character, () => battle.combatants.filter((combatant) => !character.dead && character.isEnemyTo(combatant)))
            return
        }

        let targettingMethod: TargetType = bestSkill.skillData.targetType
    
        if (bestSkill.skillData.targetType == TargetType.TARGET_ANY) {
            const friendlyNeedsHelp = battle.combatants.some((c) => !character.isEnemyTo(c) && !c.dead && bestSkill!.getCastPriority(character, c) > 1)
            // coinflip
            if (friendlyNeedsHelp && Math.round(Math.random())) {
                targettingMethod = TargetType.TARGET_FRIENDLY
            } else {
                targettingMethod = TargetType.TARGET_ENEMY
            }
        }

        let aiPreferredTarget = bestSkill.skillData.aiTargetting

        let validTargets = shuffleArray(battle.combatants.filter((c) => bestSkill?.isTargetValid(character, c)))

        if (targettingMethod == TargetType.TARGET_FRIENDLY) {
            const getMostDireFriendly = (skill: Skill) => {
                let mostDireFriendly = null
                for (const friendly of validTargets) {
                    if (mostDireFriendly == null || skill.getCastPriority(character, friendly) > skill.getCastPriority(character, mostDireFriendly)) {
                        mostDireFriendly = friendly
                    }
                }

                return mostDireFriendly
            }

            if (getMostDireFriendly(bestSkill) == null) {
                return this.castBestSkill(character, battle)
            }

            bestSkill.cast(character, () => {
                return [getMostDireFriendly(bestSkill!) || validTargets[0]]
            })
            return
        }

        if (aiPreferredTarget == AiTargetting.HIGHEST_THREAT) {
            let randomTarget = pickRandom(validTargets) as Character

            bestSkill.cast(character, () => {
                let target = character.ai?.getHighestThreatTarget()

                if (!target) {
                    if (!randomTarget || randomTarget.dead) {
                        randomTarget = pickRandom(validTargets) as Character
                    }

                    target = randomTarget
                }

                return [target]
            })
            return
        }
        
        if (aiPreferredTarget == AiTargetting.RANDOM) {
            let randomTarget = pickRandom(validTargets) as Character
            bestSkill.cast(character,  () => {
                if (!randomTarget || randomTarget.dead) {
                    randomTarget = pickRandom(validTargets) as Character
                }

                return [randomTarget]
            })
            return
        }
    }
}