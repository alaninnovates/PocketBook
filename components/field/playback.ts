export const interpolatePosition = (
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    progress: number,
): { x: number; y: number } => {
    return {
        x: startPos.x + (endPos.x - startPos.x) * progress,
        y: startPos.y + (endPos.y - startPos.y) * progress,
    };
};
