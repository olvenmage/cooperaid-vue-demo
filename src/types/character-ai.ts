import type Character from './character';
import type Skill from './skill';
import type Identity from './identity'
import shuffleArray from '@/utils/shuffleArray';

interface ThreatEntry {
    character: Character
    threat: number
}

export default class CharacterAI {
    private threatMap: ThreatEntry[] = [];
    private identity: Identity;

    constructor(identity: Identity) {
        this.identity = identity
    }

    getHighestThreatTarget(): Character|null {
        let highestThreatTarget: ThreatEntry|null = null;

        this.threatMap.forEach(entry => {
            if (entry.character.dead) {
                entry.threat = 0;
                return
            }

            if (highestThreatTarget == null) {
                highestThreatTarget = entry;
                return;
            }

            if (entry.threat > highestThreatTarget.threat) {
                highestThreatTarget = entry;
            }
        });

        if (highestThreatTarget != null) {
            return (highestThreatTarget as ThreatEntry).character
        } else {
            return null
        }
    }

    raiseThreat(character: Character, amount: number) {
        const existingCharacter = this.threatMap.find((entry) => entry.character.id == character.id);

        if (existingCharacter != null) {
            existingCharacter.threat += amount;
        } else {
            this.threatMap.push({
                character,
                threat: amount,
            })
        }
    }
}