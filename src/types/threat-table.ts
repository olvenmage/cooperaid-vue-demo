import type Character from './character';
import type Skill from './skill';
import type Identity from './identity'
import shuffleArray from '@/utils/shuffleArray';
import GameSettings from '@/core/settings';

interface ThreatEntry {
    character: Character
    threat: number
}

export default class ThreatTable {
    private threatTable: ThreatEntry[] = [];
    private currentTarget: ThreatEntry|null = null
    tauntedByCharacter: Character|null = null
    tauntedTimeout = 0

    getCurrentTarget(): Character|null {
        if (this.tauntedByCharacter) {
            return this.tauntedByCharacter
        }

        if (!this.currentTarget || this.currentTarget.character.dead) {
            this.determineCurrentTarget()
        }

        return this.currentTarget?.character || null
    }

    tauntedBy(character: Character, durationInMs: number) {
        clearTimeout(this.tauntedTimeout)
        const entry = this.getEntryForCharacter(character)

        entry.threat = this.getTopOfTheThreatTable()?.threat || 10

        this.currentTarget = entry

        this.tauntedByCharacter = character

        this.tauntedTimeout = setTimeout(() => {
            this.tauntedByCharacter = null
        }, durationInMs / GameSettings.speedFactor)
    }

    getTopOfTheThreatTable(): ThreatEntry|null {
        let highestThreatTarget: ThreatEntry|null = null;

        this.threatTable.forEach(entry => {
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

        return highestThreatTarget
    }

    determineCurrentTarget(): void {
        const highestThreat = this.getTopOfTheThreatTable()

        if (!this.currentTarget || this.currentTarget.character.dead) {
            this.currentTarget = highestThreat
            return;
        }

        if (!highestThreat) {
            this.currentTarget = null;
            return
        }

        if (highestThreat?.character.id == this.currentTarget.character.id) {
            return
        }

        if (highestThreat.threat * ( 1 + GameSettings.threatStealBuffer) > this.currentTarget.threat) {
            this.currentTarget = highestThreat
        }
    }

    raiseThreat(character: Character, amount: number) {
        const threatEntry = this.getEntryForCharacter(character)

        threatEntry.threat += amount

        this.determineCurrentTarget()

        return threatEntry
    }

    private getEntryForCharacter(character: Character): ThreatEntry {
        const existingEntry = this.threatTable.find((entry) => entry.character.id == character.id);

        if (existingEntry) return existingEntry;

        const newEntry = {
            character,
            threat: 0,
        }

        this.threatTable.push(newEntry)

        return newEntry
    }
}