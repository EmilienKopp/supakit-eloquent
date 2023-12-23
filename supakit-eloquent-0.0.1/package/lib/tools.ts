

export function isClientSide() {
    return typeof window !== "undefined";
}

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
