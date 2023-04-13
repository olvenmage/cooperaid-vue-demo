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

        this.castBestSkill(character, battle)
    }

    private static castBestSkill(character: Character, battle: Battle) {
        const skills = character.skills
        shuffleArray(skills)

        let bestSkill: Skill|null = null

        for (const skill of skills) {
            if (skill.onCooldown) {
                continue
            }
            
            if (skill.energyCost > character.energyBar.current) {
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
            if (bestSkill == null || skill.energyCost > bestSkill.energyCost) {
                bestSkill = skill
            }
        }

        if (bestSkill == null) {
            return
        }

        if (bestSkill.targetType == TargetType.TARGET_NONE) {
            bestSkill.cast(character, [])
            return
        }

        if (bestSkill.targetType == TargetType.TARGET_ALL_ENEMIES) {
            bestSkill.cast(character, battle.combatants.filter((combatant) => character.isEnemyTo(combatant)))
            return
        }

        let targettingMethod: TargetType = bestSkill.targetType
    
        if (bestSkill.targetType == TargetType.TARGET_ANY) {
            const friendlyNeedsHelp = battle.combatants.some((c) => !character.isEnemyTo(c) && !c.dead && bestSkill!.getCastPriority(character, c) > 1)
            // coinflip
            if (friendlyNeedsHelp && Math.round(Math.random())) {
                targettingMethod = TargetType.TARGET_FRIENDLY
            } else {
                targettingMethod = TargetType.TARGET_ENEMY
            }
        }

        let aiPreferredTarget = bestSkill.aiTargetting

        let validTargets = battle.combatants

        if (targettingMethod == TargetType.TARGET_FRIENDLY) {
            validTargets = battle.combatants.filter((c) => !character.isEnemyTo(c))

            let mostDireFriendly = null
            for (const friendly of validTargets) {
                if (mostDireFriendly == null || bestSkill.getCastPriority(character, friendly) > bestSkill.getCastPriority(character, mostDireFriendly)) {
                    mostDireFriendly = friendly
                }
            }

            if (mostDireFriendly == null) {
                return this.castBestSkill(character, battle)
            }

            bestSkill.cast(character, [mostDireFriendly])
            return
        } else if (targettingMethod == TargetType.TARGET_ENEMY){
            validTargets = battle.combatants.filter((c) => character.isEnemyTo(c))
        }

        if (aiPreferredTarget == AiTargetting.HIGHEST_THREAT) {
            const target = character.ai!.getHighestThreatTarget()

            if (!target) {
                aiPreferredTarget = AiTargetting.RANDOM
            } else {
                bestSkill.cast(character, [target])
                return
            }
        }
        
        if (aiPreferredTarget == AiTargetting.RANDOM) {
            const target: Character = pickRandom(validTargets) as Character

            bestSkill.cast(character, [target])
            return
        }
    }
}