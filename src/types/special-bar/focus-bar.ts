import type Character from '../character'
import type CharacterStats from '../character-stats'
import ClassBar from '../class-bar'
import { isEmpowerableSkil } from '../skill-types/empowerable-skill'

export default class FocusBar extends ClassBar {
    constructor() {
        super(100, "#AB6DAC")
    }

    public tickInterval: number = 500
    tickConsumeAmount = 10

    tickEffect(character: Character) {
        const castReductionMS = Math.round(this.tickIntervalSpeedRelative / 2)
        const cdReductionMS = this.tickIntervalSpeedRelative

        if (character.castingSkill && character.castingSkill.castingTimer < (castReductionMS / 2)) {
            character.castingSkill.castingTimer += castReductionMS
        } else {
            // on cooldown skills, longest cd first
            const skills = character.skills.filter((sk) => sk.onCooldown).sort((sk1, sk2) => Math.sign(sk2.onCooldownTimer - sk1.onCooldownTimer))
            
            if (skills[0]) {
                skills[0].onCooldownTimer += cdReductionMS
            }
        }
    }

    override mutateStats(stats: CharacterStats): CharacterStats {
        return stats
    }
}   