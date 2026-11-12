import { isEnded } from "./safe.js";
export function createChain(req, res, middlewares, hooks) {
    let index = 0;
    let seqCounter = 0;
    const running = new Set();
    const waiters = [];
    function settle() {
        for (let i = waiters.length - 1; i >= 0; i--) {
            const waiter = waiters[i];
            let blocked = false;
            for (const seq of running) {
                if (seq > waiter.from) {
                    blocked = true;
                    break;
                }
            }
            if (blocked)
                continue;
            waiters.splice(i, 1);
            waiter.resolve();
        }
    }
    async function invoke(middleware, seq) {
        running.add(seq);
        try {
            hooks.start?.(middleware);
            const result = await middleware.middleware(req, res, nextFor(seq));
            if (result && !isEnded(res))
                hooks.result?.(result);
        }
        catch (err) {
            hooks.error?.(err, middleware);
        }
        finally {
            running.delete(seq);
            settle();
        }
    }
    function nextFor(from) {
        let called = false;
        return function next() {
            if (called)
                throw new Error("next() called multiple times");
            called = true;
            if (isEnded(res))
                return Promise.resolve();
            if (index >= middlewares.length) {
                hooks.exhausted?.();
                return Promise.resolve();
            }
            const middleware = middlewares[index++];
            const seq = ++seqCounter;
            const wait = new Promise(resolve => {
                waiters.push({
                    from,
                    resolve,
                });
            });
            void invoke(middleware, seq);
            settle();
            return wait;
        };
    }
    return nextFor(-1);
}
