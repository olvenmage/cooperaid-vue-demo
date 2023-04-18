export default abstract class Upgrade<T> {
    public abstract name: string
    public abstract description: string

    abstract applyUpgrade(item: T): void
    abstract applies(item: T): boolean
}