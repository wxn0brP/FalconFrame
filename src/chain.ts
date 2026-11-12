import { isEnded } from "./safe";
import type { FFResponse } from "./res";
import type { FFRequest, Middleware } from "./types";

export interface ChainHooks {
	start?: (middleware: Middleware) => void;
	result?: (result: any) => void;
	error?: (err: any, middleware: Middleware) => void;
	exhausted?: () => void;
}

export function createChain(
	req: FFRequest,
	res: FFResponse,
	middlewares: Middleware[],
	hooks: ChainHooks,
) {
	let index = 0;
	let seqCounter = 0;
	const running = new Set<number>();
	const waiters: {
		from: number;
		resolve: () => void;
	}[] = [];

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

			if (blocked) continue;

			waiters.splice(i, 1);
			waiter.resolve();
		}
	}

	async function invoke(middleware: Middleware, seq: number) {
		running.add(seq);
		try {
			hooks.start?.(middleware);
			const result = await middleware.middleware(req, res, nextFor(seq));
			if (result && !isEnded(res)) hooks.result?.(result);
		} catch (err) {
			hooks.error?.(err, middleware);
		} finally {
			running.delete(seq);
			settle();
		}
	}

	function nextFor(from: number) {
		let called = false;

		return function next() {
			if (called) throw new Error("next() called multiple times");
			called = true;

			if (isEnded(res)) return Promise.resolve();

			if (index >= middlewares.length) {
				hooks.exhausted?.();
				return Promise.resolve();
			}

			const middleware = middlewares[index++];
			const seq = ++seqCounter;
			const wait = new Promise<void>(resolve => {
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
