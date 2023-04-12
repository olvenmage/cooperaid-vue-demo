export default function pickRandom(items: unknown[]) {
    return items[Math.floor(Math.random()*items.length)];
}