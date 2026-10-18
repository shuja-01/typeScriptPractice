/* ==========================================================================
   HOOKS IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  ==========================================================================
  WHAT ARE HOOKS?
  ==========================================================================
  In modern software development, a "Hook" refers to two major concepts:

  1. REACT / UI HOOKS:
     Functions that allow you to "hook into" component state, lifecycle,
     and side effects (e.g., useState, useReducer, useRef, Custom Hooks).
     TypeScript makes these hooks 100% type-safe and eliminates runtime crashes.

  2. ARCHITECTURAL / LIFECYCLE HOOKS:
     A design pattern where a system allows external logic to run at specific
     stages of an operation (e.g., "beforeSave", "afterResponse", "onError").
*/


// ==========================================================================
// 1. TYPING `useState`: INFERENCE VS EXPLICIT GENERICS
// ==========================================================================
/*
  Under the hood, `useState` has the following TypeScript signature:
      function useState<T>(initialState: T | (() => T)): [T, (action: T | ((prev: T) => T)) => void]

  Two major scenarios:
  - Scenario A: Initial value is clear (TypeScript infers type automatically).
  - Scenario B: Initial value is `null` or `undefined` (MUST provide explicit generic <T | null>).
*/

// A. Self-Contained Typed useState Implementation:
type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<A> = (value: A) => void;

function createUseState<T>(initialValue: T): [() => T, Dispatch<SetStateAction<T>>] {
    let state = initialValue;

    const getState = (): T => state;

    const setState: Dispatch<SetStateAction<T>> = (action) => {
        if (typeof action === "function") {
            // Type narrowing: action is an updater function `(prev: T) => T`
            state = (action as (prev: T) => T)(state);
        } else {
            // action is directly value `T`
            state = action;
        }
        console.log(`[useState] State updated to:`, state);
    };

    return [getState, setState];
}

// Scenario A: Inferred Type (number)
const [getCount, setCount] = createUseState(0);
setCount(5);                 // Direct value
setCount((prev) => prev + 1); // Functional updater (prev is typed as number)
console.log("Current Count:", getCount());

// Scenario B: Explicit Generic Type with Union (e.g. User or null)
interface UserProfile {
    id: number;
    username: string;
}

// Without `<UserProfile | null>`, TS would infer type as `null` permanently!
const [getUser, setUser] = createUseState<UserProfile | null>(null);
setUser({ id: 101, username: "Shuja" }); //  Valid!
console.log("Current User:", getUser());


// ==========================================================================
// 2. TYPING `useReducer` WITH DISCRIMINATED UNIONS (PRO STATE MANAGEMENT)
// ==========================================================================
/*
  For complex state transitions, `useReducer` paired with TypeScript
  Discriminated Unions guarantees that invalid actions cannot be dispatched.
*/

// 1. Define the State Shape:
interface CartState {
    itemsCount: number;
    totalAmount: number;
    hasDiscount: boolean;
}

// 2. Define Actions using Discriminated Unions (The `type` field is the discriminator):
type CartAction =
    | { type: "ADD_ITEM"; price: number }
    | { type: "REMOVE_ITEM"; price: number }
    | { type: "APPLY_DISCOUNT"; discountPercent: number }
    | { type: "CLEAR_CART" };

// 3. Strongly Typed Reducer Function:
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD_ITEM":
            // TypeScript automatically knows `action.price` exists!
            return {
                ...state,
                itemsCount: state.itemsCount + 1,
                totalAmount: state.totalAmount + action.price,
            };

        case "REMOVE_ITEM":
            return {
                ...state,
                itemsCount: Math.max(0, state.itemsCount - 1),
                totalAmount: Math.max(0, state.totalAmount - action.price),
            };

        case "APPLY_DISCOUNT":
            if (state.hasDiscount) return state; // Already discounted
            const discountFactor = (100 - action.discountPercent) / 100;
            return {
                ...state,
                hasDiscount: true,
                totalAmount: state.totalAmount * discountFactor,
            };

        case "CLEAR_CART":
            return { itemsCount: 0, totalAmount: 0, hasDiscount: false };

        default:
            return state;
    }
}

// Testing the reducer:
let initialCart: CartState = { itemsCount: 0, totalAmount: 0, hasDiscount: false };
initialCart = cartReducer(initialCart, { type: "ADD_ITEM", price: 100 });
initialCart = cartReducer(initialCart, { type: "ADD_ITEM", price: 50 });
initialCart = cartReducer(initialCart, { type: "APPLY_DISCOUNT", discountPercent: 10 });
console.log("Final Cart State:", initialCart); // Total: $135 (10% off $150)


// ==========================================================================
// 3. TYPING `useRef` (MUTABLE VALUES VS DOM NODES)
// ==========================================================================
/*
  In TypeScript, `useRef` behaves differently based on how you type it:

  - Case 1: Mutable Value Ref (holds a value that doesn't trigger re-renders):
    `const renderCount = useRef<number>(0);` -> `renderCount.current` is MUTABLE (number).

  - Case 2: DOM Element Ref:
    `const inputRef = useRef<HTMLInputElement | null>(null);` -> `.current` is managed by React.
*/

type RefObject<T> = { current: T };

function createUseRef<T>(initialValue: T): RefObject<T> {
    return { current: initialValue };
}

// Mutable instance container:
const timerIdRef = createUseRef<number | null>(null);
timerIdRef.current = 12345; //  Allowed to reassign .current
console.log("Timer ID in Ref:", timerIdRef.current);


// ==========================================================================
// 4. WRITING CUSTOM HOOKS (THE CRUCIAL `as const` TUPLE RULE!)
// ==========================================================================
/*
  COMMON INTERVIEW GOTCHA:
  When a custom hook returns an array `[value, updater]`:
  - Without `as const`, TypeScript infers: `(boolean | (() => void))[]` (an array of unions!).
  - With `as const` (or explicit tuple type), TypeScript preserves the EXACT tuple positions:
    `readonly [boolean, () => void]`.
*/

// --- Custom Hook 1: useToggle ---
function useToggle(initialValue: boolean = false) {
    let state = initialValue;

    const toggle = (): void => {
        state = !state;
        console.log(`[useToggle] State toggled to: ${state}`);
    };

    const getValue = (): boolean => state;

    // ⚠️ CRITICAL: `as const` preserves the tuple index types:
    // Index 0 is guaranteed to be a function returning boolean.
    // Index 1 is guaranteed to be a toggle function.
    return [getValue, toggle] as const;
}

const [isModalOpen, toggleModal] = useToggle(false);
toggleModal();


// --- Custom Hook 2: Generic `useFetch` Hook Pattern ---
interface FetchState<TData> {
    data: TData | null;
    loading: boolean;
    error: string | null;
}

// Generic custom hook that works with ANY data model:
async function simulateUseFetch<T>(mockData: T, shouldFail: boolean = false): Promise<FetchState<T>> {
    let state: FetchState<T> = { data: null, loading: true, error: null };

    // Simulating network delay:
    if (shouldFail) {
        state = { data: null, loading: false, error: "Network request failed (500)" };
    } else {
        state = { data: mockData, loading: false, error: null };
    }

    return state;
}

async function testFetchHook() {
    type Product = { id: number; title: string };
    const result = await simulateUseFetch<Product>({ id: 1, title: "Mechanical Keyboard" });
    if (result.data) {
        console.log(`[useFetch] Product loaded: ${result.data.title}`);
    }
}
testFetchHook();


// ==========================================================================
// 5. PRO ARCHITECTURE: TYPE-SAFE LIFECYCLE / PLUGIN HOOK MANAGER
// ==========================================================================
/*
  Outside of UI frameworks, "Hooks" are an architectural pattern used in
  backend systems (e.g. Mongoose hooks, Fastify/Express middleware, Git hooks).
  Here is how to build a 100% type-safe Hook Manager using TypeScript Generics:
*/

// 1. Define the supported Hook events and their expected arguments:
interface ServerLifecycleHooks {
    beforeRequest: (url: string, method: string) => void;
    afterResponse: (statusCode: number, durationMs: number) => void;
    onError: (err: Error) => void;
}

// 2. Generic Hook Manager class:
class HookManager<THooks extends object> {
    private hooksMap: {
        [K in keyof THooks]?: Array<THooks[K]>;
    } = {};

    // Register a hook callback with strict type checking:
    public register<K extends keyof THooks>(hookName: K, callback: THooks[K]): void {
        if (!this.hooksMap[hookName]) {
            this.hooksMap[hookName] = [];
        }
        this.hooksMap[hookName]!.push(callback);
        console.log(`[HookManager] Registered listener for: "${String(hookName)}"`);
    }

    // Trigger all registered hooks with strictly typed parameters:
    public trigger<K extends keyof THooks>(
        hookName: K,
        ...args: THooks[K] extends (...args: infer P) => any ? P : never
    ): void {
        const listeners = this.hooksMap[hookName];
        if (listeners) {
            for (const listener of listeners) {
                if (typeof listener === "function") {
                    (listener as Function)(...args);
                }
            }
        }
    }
}


// 3. Using the Hook Manager in a production scenario:
const serverHooks = new HookManager<ServerLifecycleHooks>();

// Registering hooks (TypeScript checks parameters automatically!):
serverHooks.register("beforeRequest", (url, method) => {
    console.log(`[HOOK beforeRequest] ${method.toUpperCase()} ${url}`);
});

serverHooks.register("afterResponse", (status, duration) => {
    console.log(`[HOOK afterResponse] Finished with status ${status} in ${duration}ms`);
});

// Triggering hooks:
serverHooks.trigger("beforeRequest", "/api/users", "get");
serverHooks.trigger("afterResponse", 200, 45);

// serverHooks.trigger("beforeRequest", 123); //  Error: Argument of type 'number' is not assignable to 'string'


// ==========================================================================
// SUMMARY CHECKLIST FOR HOOKS IN TYPESCRIPT
// ==========================================================================
/*
  1. `useState<T>`: Use explicit generic `<T | null>` when initial value is null.
  2. `useReducer`: Always use Discriminated Unions (`type: "ACTION"`) for action typing.
  3. Custom Hook return values: Always add `as const` to tuple returns `[value, updater] as const`.
  4. Generic Custom Hooks: Pass `<T>` to make custom data hooks reusable across different entities.
  5. Lifecycle Hooks: Use `keyof THooks` and `Parameters<THooks[K]>` for compile-time verified callbacks.
*/
