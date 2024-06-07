export function utilGetAssets(name) {
    return new URL(`../assets/${name}`, import.meta.url).href;
}
