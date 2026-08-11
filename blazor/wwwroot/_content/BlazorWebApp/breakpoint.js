// ESM module for BreakpointService. Mirrors src/hooks/useBreakpoint.ts.

const QUERIES = [
    { bp: "Xs", mq: "(max-width: 480px)" },
    { bp: "Sm", mq: "(min-width: 481px) and (max-width: 768px)" },
    { bp: "Md", mq: "(min-width: 769px) and (max-width: 1024px)" },
    { bp: "Lg", mq: "(min-width: 1025px) and (max-width: 1280px)" },
    { bp: "Xl", mq: "(min-width: 1281px)" },
];

let handlers = [];

export function subscribe(dotnetRef) {
    // Clean up any prior subscriptions
    for (const { mql, handler } of handlers) {
        mql.removeEventListener("change", handler);
    }
    handlers = [];

    for (const q of QUERIES) {
        const mql = matchMedia(q.mq);
        const handler = (e) => {
            if (e.matches) {
                dotnetRef.invokeMethodAsync("OnBreakpointChangedAsync", q.bp);
            }
        };
        mql.addEventListener("change", handler);
        handlers.push({ mql, handler });
    }

    // Fire the current bucket once on subscribe so the server state matches the viewport
    const initial = QUERIES.find((q) => matchMedia(q.mq).matches);
    if (initial) {
        dotnetRef.invokeMethodAsync("OnBreakpointChangedAsync", initial.bp);
    }
}
