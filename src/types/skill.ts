import Character from './character';

enum TargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_ALL
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

    canCast(castBy: Character): boolean {
        if (castBy.casting) {
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
            this.onCooldownTimer += 1000
            this.incrementCooldown()
        }, 990)
    }

    incrementCastTime(castBy: Character, targets: Character[]) {
        if (castBy.dead) {
            this.castingTimer = 0
            this.casting = false
            this.castingTargets = []
            castBy.casting = false
           
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
            this.castingTimer += 1000
            this.incrementCastTime(castBy, targets)
        }, 990)
    }

    areTargetsValid(targets: Character[]) {
        return targets.some((char) => !char.dead)
    }

    cast(castBy: Character, targets: Character[]) {
        if (!this.canCast(castBy)) {
            return false;
        }

        if (!this.areTargetsValid(targets)) {
            return false;
        }

        castBy.energyBar.current -= this.energyCost;

        castBy.casting = true
        this.incrementCastTime(castBy, targets)
    }

    doCast(castBy: Character, targets: Character[]) {
        this.castSkill(castBy, targets);

        this.onCooldown = true
        castBy.casting = false
        this.incrementCooldown()
    }

    abstract castSkill(castBy: Character, targets: Character[]): void
}

export { TargetType }