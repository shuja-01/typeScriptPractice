/* ==========================================================================
   STATE MANAGEMENT IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  ==========================================================================
  WHAT IS "STATE"?
  ==========================================================================
  State is DATA THAT CHANGES OVER TIME and dictates the behavior, UI,
  or workflow of an application at any given moment.

  STATELESS VS STATEFUL:
  - Stateless: A pure function `add(2, 3) => 5`. Given the same inputs, it ALWAYS
    returns the same output. It remembers nothing.
  - Stateful: A shopping cart or user session. The output depends on past interactions
    and currently stored data.

  WHY TYPESCRIPT IS REVOLUTIONARY FOR STATE:
  In vanilla JavaScript, state is prone to:
  1. Accidental direct mutation (mutating objects by reference).
  2. "Impossible States" (e.g. `isLoading: true` AND `isError: true` at the same time).
  3. Unchecked transitions (e.g. transitioning an order from "DELIVERED" to "DRAFT").

  TypeScript solves ALL of these using `readonly`, Discriminated Unions, and State Machines!
*/


// ==========================================================================
// 1. IMMUTABLE STATE & `readonly` (THE FOUNDATION)
// ==========================================================================
/*
  Rule #1 of State Management: NEVER mutate state directly!
  Always produce a NEW state object containing the updates.
*/

// --- (A) Bad Practice: Mutable State ---
interface MutableUserProfile {
    username: string;
    score: number;
}

const badUser: MutableUserProfile = { username: "Shuja", score: 10 };
badUser.score = 20; // Directly mutating data in place (breaks change detection!)

// --- (B) Good Practice: Deep Immutability with `readonly` ---
interface UserState {
    readonly id: number;
    readonly username: string;
    readonly score: number;
    readonly tags: readonly string[]; // Immutable array
}

const initialUserState: UserState = {
    id: 1,
    username: "Shuja",
    score: 100,
    tags: ["typescript", "coder"],
};

// initialUserState.score = 150; // Error: Cannot assign to 'score' because it is read-only.
// initialUserState.tags.push("react"); // Error: Property 'push' does not exist on 'readonly string[]'

// Pure state update function (produces a new state snapshot):
function incrementScore(state: UserState, points: number): UserState {
    return {
        ...state,
        score: state.score + points, // Non-destructive copy
    };
}

const updatedUserState = incrementScore(initialUserState, 50);
console.log("Original User Score:", initialUserState.score); // 100 (Untouched!)
console.log("Updated User Score:", updatedUserState.score);   // 150 (New state!)


// ==========================================================================
// 2. ELIMINATING "IMPOSSIBLE STATES" WITH DISCRIMINATED UNIONS
// ==========================================================================
/*
  THE ANTI-PATTERN: "Flag Soup"
  interface BadAsyncState {
      isLoading: boolean;
      isError: boolean;
      data?: User[];
      errorMessage?: string;
  }
 Problem: What if `isLoading = true` AND `isError = true`?
  That's an IMPOSSIBLE STATE that causes confusing UI glitches.

  THE PRO SOLUTION: Discriminated Unions
  Make each state mutually exclusive!
*/

type AsyncState<TData> =
    | { status: "IDLE" }
    | { status: "LOADING" }
    | { status: "SUCCESS"; data: TData; receivedAt: Date }
    | { status: "ERROR"; error: string; code: number };

// Helper function to render/process state safely:
function renderAsyncState<T>(state: AsyncState<T>): string {
    switch (state.status) {
        case "IDLE":
            return "Press button to fetch data.";

        case "LOADING":
            return "Loading, please wait...";

        case "SUCCESS":
            // TypeScript automatically KNOWS `state.data` and `state.receivedAt` exist!
            return `Success! Data received at ${state.receivedAt.toLocaleTimeString()}`;

        case "ERROR":
            // TypeScript automatically KNOWS `state.error` and `state.code` exist!
            return `Error [${state.code}]: ${state.error}`;

        default:
            // Exhaustiveness checking: If someone adds a new status to AsyncState,
            // TypeScript will flag an error here at compile time!
            const _unreachable: never = state;
            return _unreachable;
    }
}

const loadingState: AsyncState<string> = { status: "LOADING" };
const successState: AsyncState<string> = {
    status: "SUCCESS",
    data: "User payload loaded",
    receivedAt: new Date(),
};

console.log(renderAsyncState(loadingState));
console.log(renderAsyncState(successState));


// ==========================================================================
// 3. FINITE STATE MACHINES (FSM): PREVENTING INVALID STATE TRANSITIONS
// ==========================================================================
/*
  A Finite State Machine defines:
  1. A fixed set of possible states.
  2. Strict transition rules (Which state can transition to which next state).

  Example: E-Commerce Order Lifecycle
  - DRAFT -> SUBMITTED
  - SUBMITTED -> SHIPPED or CANCELLED
  - SHIPPED -> DELIVERED
  - DELIVERED -> CANNOT be cancelled!
*/

type OrderStatus = "DRAFT" | "SUBMITTED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

class OrderStateMachine {
    private currentStatus: OrderStatus = "DRAFT";

    // Transition matrix defining valid next states:
    private readonly transitions: Record<OrderStatus, OrderStatus[]> = {
        DRAFT: ["SUBMITTED", "CANCELLED"],
        SUBMITTED: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED"], // Once shipped, cannot be cancelled!
        DELIVERED: [],          // Final terminal state
        CANCELLED: [],          // Final terminal state
    };

    public getStatus(): OrderStatus {
        return this.currentStatus;
    }

    public transitionTo(nextStatus: OrderStatus): boolean {
        const allowedNextStates = this.transitions[this.currentStatus];

        if (!allowedNextStates.includes(nextStatus)) {
            console.log(
                `[INVALID TRANSITION] Cannot transition from "${this.currentStatus}" to "${nextStatus}"!`
            );
            return false;
        }

        console.log(` [TRANSITION] Order moved from "${this.currentStatus}" -> "${nextStatus}"`);
        this.currentStatus = nextStatus;
        return true;
    }
}

const myOrder = new OrderStateMachine();
myOrder.transitionTo("SUBMITTED"); // Allowed
myOrder.transitionTo("SHIPPED");   // Allowed
myOrder.transitionTo("CANCELLED"); // Blocked! Cannot cancel after shipping
myOrder.transitionTo("DELIVERED"); // Allowed


// ==========================================================================
// 4. PRO PATTERN: BUILDING A TYPE-SAFE REACTIVE STATE STORE
// ==========================================================================
/*
  This demonstrates how libraries like Redux, Zustand, or Pinia work under the hood.
  Features:
  1. Encapsulated private state.
  2. Readonly snapshot access.
  3. Immutable updater functions.
  4. Reactive subscriptions (notifying listeners on state changes).
*/

type StateListener<T> = (newState: T, previousState: T) => void;

class ReactiveStore<TState extends object> {
    private state: TState;
    private listeners: Set<StateListener<TState>> = new Set();

    constructor(initialState: TState) {
        this.state = Object.freeze({ ...initialState }); // Lock initial snapshot
    }

    // 1. Get current immutable state snapshot
    public getState(): Readonly<TState> {
        return this.state;
    }

    // 2. Update state immutably via an updater callback
    public setState(updater: (prevState: TState) => Partial<TState>): void {
        const previousState = this.state;
        const partialUpdate = updater(this.state);

        // Merge into a brand new frozen state object
        this.state = Object.freeze({
            ...this.state,
            ...partialUpdate,
        });

        // Notify all registered subscribers
        this.notify(this.state, previousState);
    }

    // 3. Subscribe to state changes (Returns an unsubscribe function)
    public subscribe(listener: StateListener<TState>): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    // 4. Select a specific slice of state with strong type inference:
    public select<K extends keyof TState>(key: K): TState[K] {
        return this.state[key];
    }

    private notify(newState: TState, previousState: TState): void {
        for (const listener of this.listeners) {
            listener(newState, previousState);
        }
    }
}

// Defining our Application State shape:
interface AppState {
    theme: "light" | "dark";
    cartItemsCount: number;
    userEmail: string | null;
}

// Initializing the Store:
const appStore = new ReactiveStore<AppState>({
    theme: "light",
    cartItemsCount: 0,
    userEmail: null,
});

// Subscribing to state changes (Reactive listener):
const unsubscribe = appStore.subscribe((newState, prevState) => {
    console.log(
        `[Store Listener] Cart changed from ${prevState.cartItemsCount} to ${newState.cartItemsCount} (Theme: ${newState.theme})`
    );
});

// Updating state:
appStore.setState((prev) => ({ cartItemsCount: prev.cartItemsCount + 1 }));
appStore.setState((prev) => ({ cartItemsCount: prev.cartItemsCount + 2, theme: "dark" }));

// Selecting a single property with type safety:
const currentTheme = appStore.select("theme"); // Type is automatically '"light" | "dark"'
console.log("Current selected theme:", currentTheme);

// Unsubscribing:
unsubscribe();
appStore.setState(() => ({ cartItemsCount: 10 })); // Will NOT trigger the listener anymore


// ==========================================================================
// 5. THE 3 TYPES OF STATE IN REAL-WORLD APPLICATIONS
// ==========================================================================
/*
  When designing apps, avoid putting everything in one giant global store!
  Categorize state into 3 distinct layers:

  1. LOCAL / COMPONENT STATE:
     - Examples: Dropdown open/close, form input values, modal visibility.
     - Best tool: Local component state / useState.

  2. GLOBAL CLIENT STATE:
     - Examples: Active user session, shopping cart, selected language/theme.
     - Best tool: Reactive store / Context / Zustand / Redux.

  3. SERVER CACHE STATE:
     - Examples: List of products from database, user profile from REST API.
     - Best tool: React Query (TanStack Query), SWR, RTK Query.
*/

console.log("\n--- State in TypeScript: Demonstration Complete! ---");
