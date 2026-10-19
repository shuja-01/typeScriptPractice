//to run :: npx tsc; node dist/jestTS.js

/* ==========================================================================
   JEST IN TYPESCRIPT: FROM FIRST PRINCIPLES TO ADVANCED TESTING
   ========================================================================== */

/*
  ==========================================================================
  WHAT IS JEST & WHY DOES EVERY MODERN TEAM USE IT?
  ==========================================================================
  Jest is a zero-configuration, batteries-included JavaScript & TypeScript
  testing framework created by Meta (Facebook).

  BEFORE JEST (The fragmented era):
  Developers had to install 4-5 separate libraries just to run tests:
  1. Test Runner: Mocha or Karma
  2. Assertion Library: Chai or Should.js
  3. Mocking & Spying Library: Sinon.js
  4. Code Coverage Tool: Istanbul / nyc

  WITH JEST (The all-in-one era):
  Jest provides EVERYTHING in a single package:
  -  Test Runner (discovers `*.test.ts` files and executes them in isolated parallel workers)
  -  Assertion Library (`expect()`, `toBe()`, `toEqual()`)
  -  Mocking & Spying System (`jest.fn()`, `jest.spyOn()`, `jest.mock()`)
  -  Code Coverage Reporter (`jest --coverage` built-in)
  -  Snapshot Testing (captures state/UI snapshots to detect unintended regressions)
*/


// ==========================================================================
// 1. THE GOLDEN RULE OF TESTING: THE "AAA" PATTERN
// ==========================================================================
/*
  Every professional test case follows the "Arrange - Act - Assert" pattern:

  1. ARRANGE: Set up the test data, objects, inputs, or mocks.
  2. ACT:     Invoke the actual function or method under test.
  3. ASSERT:  Verify that the result matches what was expected.
*/

// Example business logic to test:
function calculateDiscount(price: number, discountPercentage: number): number {
    if (price < 0 || discountPercentage < 0 || discountPercentage > 100) {
        throw new Error("Invalid price or discount percentage");
    }
    const discount = (price * discountPercentage) / 100;
    return Number((price - discount).toFixed(2));
}

interface UserAccount {
    id: string;
    name: string;
    role: "admin" | "member";
    preferences?: { theme: string };
}

function createUser(name: string, role: "admin" | "member"): UserAccount {
    return {
        id: `usr_${Date.now()}`,
        name,
        role,
    };
}


// ==========================================================================
// 2. HOW JEST WORKS UNDER THE HOOD (MINI-JEST ENGINE)
// ==========================================================================
/*
  To truly understand Jest, let's look at how `describe()`, `test()`, and
  `expect()` actually function internally. Below is a self-contained test
  engine demonstrating Jest's core architecture:
*/

class MiniJestAssertion<T> {
    constructor(private actual: T, private isNot: boolean = false) { }

    // Negation modifier (.not)
    public get not(): MiniJestAssertion<T> {
        return new MiniJestAssertion(this.actual, !this.isNot);
    }

    // 1. toBe: Primitive equality (Object.is)
    public toBe(expected: any): void {
        const pass = Object.is(this.actual, expected);
        const condition = this.isNot ? !pass : pass;
        if (!condition) {
            throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to be" : "to be"} ${JSON.stringify(expected)}`);
        }
    }

    // 2. toEqual: Deep structural equality (recursively compares objects & arrays)
    public toEqual(expected: any): void {
        const pass = JSON.stringify(this.actual) === JSON.stringify(expected);
        const condition = this.isNot ? !pass : pass;
        if (!condition) {
            throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to deeply equal" : "to deeply equal"} ${JSON.stringify(expected)}`);
        }
    }

    // 3. toContain: Item in Array or substring in String
    public toContain(expectedItem: any): void {
        const pass = Array.isArray(this.actual)
            ? (this.actual as any[]).includes(expectedItem)
            : typeof this.actual === "string"
                ? (this.actual as string).includes(expectedItem)
                : false;

        const condition = this.isNot ? !pass : pass;
        if (!condition) {
            throw new Error(`Expected item to ${this.isNot ? "NOT " : ""}contain ${JSON.stringify(expectedItem)}`);
        }
    }

    // 4. toThrow: Verifies that a function threw an error
    public toThrow(expectedErrorMessage?: string): void {
        if (typeof this.actual !== "function") {
            throw new Error("toThrow assertion requires a function: expect(() => fn()).toThrow()");
        }
        let threw = false;
        let actualError: any = null;
        try {
            (this.actual as unknown as () => void)();
        } catch (err: any) {
            threw = true;
            actualError = err;
        }

        const pass = threw && (!expectedErrorMessage || actualError?.message?.includes(expectedErrorMessage));
        const condition = this.isNot ? !pass : pass;
        if (!condition) {
            throw new Error(`Expected function ${this.isNot ? "NOT to throw" : "to throw error"} matching "${expectedErrorMessage ?? "any error"}"`);
        }
    }
}

// Mini-Jest Test Runner Framework
const miniJest = {
    expect<T>(actual: T): MiniJestAssertion<T> {
        return new MiniJestAssertion(actual);
    },

    describe(suiteName: string, suiteFn: () => void): void {
        console.log(`\n\x1b[1m\x1b[36m● Test Suite: ${suiteName}\x1b[0m`);
        suiteFn();
    },

    test(testName: string, testFn: () => void | Promise<void>): void {
        try {
            testFn();
            console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
        } catch (error: any) {
            console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName}`);
            console.error(`    \x1b[31mError: ${error.message}\x1b[0m`);
        }
    },

    // Simple mock function creator (like jest.fn())
    fn<TArgs extends any[], TReturn>(impl: (...args: TArgs) => TReturn) {
        const calls: TArgs[] = [];
        const mock = (...args: TArgs): TReturn => {
            calls.push(args);
            return impl(...args);
        };
        mock.mock = {
            calls,
            get callCount() {
                return calls.length;
            },
        };
        return mock;
    },
};


// ==========================================================================
// 3. ESSENTIAL JEST MATCHERS (toBe vs toEqual vs toStrictEqual)
// ==========================================================================
/*
  THE MOST COMMON MISTAKE IN JEST:
  - `toBe()` checks OBJECT IDENTITY (=== or Object.is).
    Use it for primitives: strings, numbers, booleans.
  - `toEqual()` checks DEEP VALUE EQUALITY.
    Use it for objects, arrays, and sets.
  - `toStrictEqual()` also verifies that object prototypes and `undefined`
    properties match strictly.
*/

console.log("=================================================");
console.log("  RUNNING TESTS WITH JEST CORE CONCEPTS");
console.log("=================================================");

miniJest.describe("1. Core Matchers & Equality Checks", () => {
    miniJest.test("toBe tests primitive numbers and strings", () => {
        // Arrange
        const price = 100;
        const discount = 20;

        // Act
        const finalPrice = calculateDiscount(price, discount);

        // Assert
        miniJest.expect(finalPrice).toBe(80);
    });

    miniJest.test("toEqual checks deep object structure (ignoring memory references)", () => {
        // Arrange & Act
        const userA = { name: "Shuja", roles: ["admin", "editor"] };
        const userB = { name: "Shuja", roles: ["admin", "editor"] };

        // Even though userA !== userB in memory, their content is IDENTICAL:
        miniJest.expect(userA).toEqual(userB);
    });

    miniJest.test("not modifier inverts any matcher", () => {
        const status = "SUCCESS";
        miniJest.expect(status).not.toBe("PENDING");
    });

    miniJest.test("toThrow catches expected exceptions safely", () => {
        // Must wrap the call inside an arrow function so Jest can intercept the error!
        miniJest.expect(() => {
            calculateDiscount(-50, 10);
        }).toThrow("Invalid price");
    });
});


// ==========================================================================
// 4. JEST LIFECYCLE HOOKS: beforeEach, afterEach, beforeAll, afterAll
// ==========================================================================
/*
  Why do we need Lifecycle Hooks?
  Tests should ALWAYS be ISOLATED and INDEPENDENT. If Test 1 mutates a database
  or array, Test 2 must NOT suffer from stale state!

  Lifecycle order:
  - beforeAll: Runs ONCE before all tests in the describe block (e.g., spin up Docker DB).
  - beforeEach: Runs BEFORE EVERY single test (e.g., reset DB / instantiate a fresh class).
  - afterEach:  Runs AFTER EVERY single test (e.g., clear mocks, remove temp files).
  - afterAll:  Runs ONCE after all tests complete (e.g., close DB connections).
*/

class ShoppingCart {
    private items: string[] = [];

    public addItem(item: string): void {
        this.items.push(item);
    }

    public getItems(): readonly string[] {
        return this.items;
    }

    public clear(): void {
        this.items = [];
    }
}

miniJest.describe("2. Lifecycle Hooks & State Isolation", () => {
    let cart: ShoppingCart;

    // Simulate beforeEach: Re-instantiate cart before each test so tests don't pollute each other
    const setupBeforeEach = () => {
        cart = new ShoppingCart();
    };

    miniJest.test("adds first item to a clean cart", () => {
        setupBeforeEach(); // In Jest, `beforeEach(() => { cart = new ShoppingCart(); })` is automatic!
        cart.addItem("Mechanical Keyboard");
        miniJest.expect(cart.getItems()).toContain("Mechanical Keyboard");
    });

    miniJest.test("cart is completely fresh in the next test", () => {
        setupBeforeEach(); // Verified clean slate!
        miniJest.expect(cart.getItems().length).toBe(0);
    });
});


// ==========================================================================
// 5. MOCKING & SPYING (jest.fn() and jest.spyOn())
// ==========================================================================
/*
  WHY MOCK?
  When unit-testing a service, you don't want to:
  1. Charge real credit cards.
  2. Send real emails or SMS messages.
  3. Hit live external APIs (slow, fragile, rate-limited).

  MOCK FUNCTIONS (`jest.fn()`):
  - Act as "spy" functions that record:
    * How many times they were called.
    * What exact arguments were passed.
    * What they returned.
*/

// Example service: Notification Dispatcher
interface EmailService {
    sendEmail(recipient: string, message: string): boolean;
}

class OrderService {
    constructor(private emailService: EmailService) { }

    public placeOrder(userEmail: string, orderId: string): boolean {
        // Business logic...
        const message = `Your order ${orderId} has been confirmed!`;
        return this.emailService.sendEmail(userEmail, message);
    }
}

miniJest.describe("3. Mock Functions & Spying (jest.fn)", () => {
    miniJest.test("tracks that emailService.sendEmail was called with correct arguments", () => {
        // ARRANGE: Create a mock function instead of sending real email
        const mockSendEmail = miniJest.fn((_to: string, _msg: string) => true);
        const dummyEmailService: EmailService = {
            sendEmail: mockSendEmail,
        };

        const orderService = new OrderService(dummyEmailService);

        // ACT
        const success = orderService.placeOrder("shuja@example.com", "ORD-999");

        // ASSERT
        miniJest.expect(success).toBe(true);
        miniJest.expect(mockSendEmail.mock.callCount).toBe(1);
        miniJest.expect(mockSendEmail.mock.calls[0]?.[0]).toBe("shuja@example.com");
        miniJest.expect(mockSendEmail.mock.calls[0]?.[1]).toBe("Your order ORD-999 has been confirmed!");
    });
});


// ==========================================================================
// 6. REAL-WORLD TESTING: TESTING GENERATOR FUNCTIONS WITH JEST
// ==========================================================================
/*
  Now, let's tie this directly to our Generator functions!
  How do we test a generator function using Jest?

  We test:
  1. Each step yields `{ value, done: false }`
  2. The final step returns `{ value, done: true }`
  3. Subsequent calls return `{ value: undefined, done: true }`
  4. Injecting values into `.next(value)` changes generator state as expected
*/

function* taskRunner(): Generator<string, number, string> {
    const inputA = yield "Task 1: Waiting for input A";
    const inputB = yield `Task 2: Received "${inputA}". Waiting for input B`;
    return 100; // Final completion code
}

miniJest.describe("4. Testing Generator Functions with Jest", () => {
    miniJest.test("verifies step-by-step yield values and done flags", () => {
        // ARRANGE
        const gen = taskRunner();

        // ACT & ASSERT: Step 1
        const step1 = gen.next();
        miniJest.expect(step1.value).toBe("Task 1: Waiting for input A");
        miniJest.expect(step1.done).toBe(false);

        // ACT & ASSERT: Step 2 (passing input "Alpha")
        const step2 = gen.next("Alpha");
        miniJest.expect(step2.value).toBe('Task 2: Received "Alpha". Waiting for input B');
        miniJest.expect(step2.done).toBe(false);

        // ACT & ASSERT: Step 3 (final completion return)
        const step3 = gen.next("Beta");
        miniJest.expect(step3.value).toBe(100);
        miniJest.expect(step3.done).toBe(true);

        // ACT & ASSERT: Step 4 (after completion)
        const step4 = gen.next();
        miniJest.expect(step4.value).toBe(undefined);
        miniJest.expect(step4.done).toBe(true);
    });
});


// ==========================================================================
// 7. HOW REAL JEST TEST SUITES ARE WRITTEN IN PRODUCTION
// ==========================================================================
/*
  In an actual Jest test file (e.g. `src/generator.test.ts`), here is the
  exact official syntax you write:

  ```typescript
  import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
  import { calculateDiscount } from './jestTS';

  describe('calculateDiscount()', () => {
      it('calculates percentage discounts accurately', () => {
          expect(calculateDiscount(200, 15)).toBe(170);
      });

      it('throws an error when discount percentage is negative', () => {
          expect(() => calculateDiscount(100, -5)).toThrow('Invalid price');
      });
  });

  describe('Mocking API requests with jest.spyOn()', () => {
      it('spies on console.log', () => {
          const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

          console.log('Hello from test');

          expect(logSpy).toHaveBeenCalledTimes(1);
          expect(logSpy).toHaveBeenCalledWith('Hello from test');

          logSpy.mockRestore(); // Always restore spies to avoid leaking into other tests!
      });
  });
  ```
*/

console.log("\n=================================================");
console.log("  ALL JEST EDUCATIONAL TESTS COMPLETED SUCCESSFULLY!");
console.log("=================================================\n");
