import GameSettings from '@/core/settings';
import type Character from './character';

enum TargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_NONE,
    TARGET_ANY,
    TARGET_ALL_ENEMIES
}

enum AiTargetting {
    HIGHEST_THREAT,
    RANDOM,
    MOST_HEALING,
}

export default abstract class Skill {
    abstract name: string
    abstract energyCost: number
    // cooldown in microseconds
    abstract cooldown: number
    abstract targetType: TargetType

    // cast time in microseconds
    castTime: number = 0
    castingTimer: number = 0
    casting = false

    public onCooldownTimer = 0
    public onCooldown = false;
    public aiTargetting = AiTargetting.HIGHEST_THREAT

    public readonly castingIncrementer = 100

    private interupted = false

    currentTargets: Character[] = []

    canCast(castBy: Character): boolean {
        if (castBy.castingSkill != null) {
            return false;
        }

        if (castBy.energyBar.current < this.energyCost) {
            return false;
        }

        if (this.onCooldown) {
            return false;
        }

        if (!castBy.actionable) {
            return false;
        }

        return true;
    }

    incrementCooldown() {
        if (this.onCooldownTimer >= this.cooldown) {
            this.onCooldownTimer = 0
            this.onCooldown = false
            return
        }

        setTimeout(() => {
            this.onCooldownTimer += 1000 * GameSettings.speedFactor
            this.incrementCooldown()
        }, 990)
    }

    incrementCastTime(castBy: Character, getTargets: () => Character[]) {
        if (castBy.dead) {
            this.castingTimer = 0
            this.casting = false
            this.currentTargets = []
            castBy.castingSkill = null
           
            return
        }

        if (!castBy.actionable) {
            setTimeout(() => {
                this.incrementCastTime(castBy, getTargets)
            }, 200)
        }

        if (this.interupted) {
            this.interupted = false;
            this.startCooldown(castBy)
            return;
        }

        this.casting = true

        if (this.castingTimer >= this.castTime) {
            this.castingTimer = 0
            this.casting = false
            this.doCast(castBy, this.currentTargets)
            this.currentTargets = []
            return
        }

        this.currentTargets = getTargets()

        setTimeout(() => {
            this.castingTimer += this.castingIncrementer * GameSettings.speedFactor
            this.incrementCastTime(castBy, getTargets)
        }, this.castingIncrementer)
    }

    areTargetsValid(targets: Character[]) {
        if (this.targetType == TargetType.TARGET_NONE) return true
        return targets.some((char) => !char.dead)
    }

    cast(castBy: Character, getTargets: () => Character[]) {
        if (!this.canCast(castBy)) {
            return false;
        }

        if (!this.areTargetsValid(getTargets())) {
            return false;
        }

        this.currentTargets = getTargets()
        this.beforeCast(castBy)
        castBy.energyBar.current -= this.energyCost

        castBy.castingSkill = this
        setTimeout(() => {
            this.incrementCastTime(castBy, getTargets)
        }, 50)
    }

    beforeCast(castBy: Character) {

    }

    doCast(castBy: Character, targets: Character[]) {
        this.castSkill(castBy, targets);

        this.startCooldown(castBy)
    }

    startCooldown(castBy: Character) {
        this.onCooldown = true
        castBy.castingSkill = null
        this.incrementCooldown()
    }

    delayCastingTime(miliseconds: number) {
        this.castingTimer = Math.min(this.castingTimer - miliseconds, 0)
    }

    interupt() {
        this.interupted = true
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 0
    }

    abstract castSkill(castBy: Character, targets: Character[]): void
}

export { TargetType, AiTargetting }