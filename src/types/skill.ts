import GameSettings from '@/core/settings';
import type Character from './character';

enum TargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_NONE,
    TARGET_ANY,
    TARGET_ALL_ENEMIES
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
    castingTargets: Character[] = []
    casting = false

    public onCooldownTimer = 0
    public onCooldown = false;

    public readonly castingIncrementer = 100

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

        if (castBy.dead) {
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

    incrementCastTime(castBy: Character, targets: Character[]) {
        if (castBy.dead) {
            this.castingTimer = 0
            this.casting = false
            this.castingTargets = []
            castBy.castingSkill = null
           
            return
        }

        this.casting = true
        this.castingTargets = targets

        if (this.castingTimer >= this.castTime) {
            this.castingTimer = 0
            this.casting = false
            this.castingTargets = []
            this.doCast(castBy, targets)
            return
        }

        setTimeout(() => {
            this.castingTimer += this.castingIncrementer * GameSettings.speedFactor
            this.incrementCastTime(castBy, targets)
        }, this.castingIncrementer)
    }

    areTargetsValid(targets: Character[]) {
        if (this.targetType == TargetType.TARGET_NONE) return true
        return targets.some((char) => !char.dead)
    }

    cast(castBy: Character, targets: Character[]) {
        if (!this.canCast(castBy)) {
            return false;
        }

        if (!this.areTargetsValid(targets)) {
            return false;
        }

        this.beforeCast(castBy, targets)
        castBy.energyBar.current -= this.energyCost;

        castBy.castingSkill = this
        setTimeout(() => {
            this.incrementCastTime(castBy, targets)
        }, 50)
    }

    beforeCast(castBy: Character, targets: Character[]) {

    }

    doCast(castBy: Character, targets: Character[]) {
        this.castSkill(castBy, targets);

        this.onCooldown = true
        castBy.castingSkill = null
        this.incrementCooldown()
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 0
    }

    abstract castSkill(castBy: Character, targets: Character[]): void
}

export { TargetType }