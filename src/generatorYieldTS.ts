/* ==========================================================================
   GENERATOR FUNCTIONS, YIELD, AND NEXT() IN TYPESCRIPT
   ========================================================================== */

/*
  ==========================================================================
  WHAT ARE GENERATOR FUNCTIONS?
  ==========================================================================
  Standard functions in JavaScript/TypeScript follow the "Run-to-Completion" model:
  - Once called, the function runs from the first line until it returns or throws.
  - No external code can pause it in the middle.
  - Its entire execution context is created and destroyed in one shot.

  GENERATOR FUNCTIONS (`function*`):
  - Can PAUSE their execution at any point and RESUME later on demand.
  - Maintain their internal state (variables, loops, counters) across pauses.
  - Calling a generator does NOT execute its code immediately; instead, it returns
    a "Generator" object that implements the Iterator and Iterable protocols.

  CORE CONCEPTS:
  1. `function*` syntax: Declares a generator function.
  2. `yield`: The "pause" operator. Pauses execution and sends a value out.
  3. `.next()`: The "resume" button. Moves execution forward to the next `yield`
     and returns an object: `{ value: any, done: boolean }`.
*/


// ==========================================================================
// 1. THE BASICS: function*, yield, AND next() STEP-BY-STEP
// ==========================================================================

function* stepByStepCounter(): Generator<number, string, void> {
    console.log("-> [Generator] Execution started");

    console.log("-> [Generator] About to yield 1");
    yield 1; // Pauses here! Returns { value: 1, done: false }

    console.log("-> [Generator] Resumed! About to yield 2");
    yield 2; // Pauses here! Returns { value: 2, done: false }

    console.log("-> [Generator] Resumed! About to yield 3");
    yield 3; // Pauses here! Returns { value: 3, done: false }

    console.log("-> [Generator] Reached the end (return)");
    return "All done!"; // Final completion: { value: "All done!", done: true }
}

console.log("=== 1. BASIC EXECUTION LIFECYCLE ===");

// Calling the generator function DOES NOT run the body!
// It simply creates the generator iterator object.
const counterIterator = stepByStepCounter();
console.log("[Caller] Generator instantiated (function body hasn't run yet!)\n");

// Step 1: First call to .next() starts the function until the 1st yield
console.log("[Caller] Calling counterIterator.next():");
const step1 = counterIterator.next();
console.log("[Caller] Received:", step1); // { value: 1, done: false }
console.log();

// Step 2: Second call resumes from 1st yield until 2nd yield
console.log("[Caller] Calling counterIterator.next():");
const step2 = counterIterator.next();
console.log("[Caller] Received:", step2); // { value: 2, done: false }
console.log();

// Step 3: Third call resumes from 2nd yield until 3rd yield
console.log("[Caller] Calling counterIterator.next():");
const step3 = counterIterator.next();
console.log("[Caller] Received:", step3); // { value: 3, done: false }
console.log();

// Step 4: Fourth call resumes until the return statement
console.log("[Caller] Calling counterIterator.next():");
const step4 = counterIterator.next();
console.log("[Caller] Received:", step4); // { value: "All done!", done: true }
console.log();

// Step 5: Any further calls return done: true with value: undefined
console.log("[Caller] Calling counterIterator.next() after completion:");
const step5 = counterIterator.next();
console.log("[Caller] Received:", step5); // { value: undefined, done: true }
console.log();


// ==========================================================================
// 2. TWO-WAY COMMUNICATION: PASSING VALUES INTO .next(value)
// ==========================================================================
/*
  `yield` is NOT just a one-way output! It is a TWO-WAY expression.
  1. It sends data OUT to the caller: `yield outputValue`
  2. It receives data IN from the caller: `const input = yield outputValue`

  IMPORTANT GOTCHA:
  - The FIRST `.next()` call CANNOT pass a value, because it only starts the
    generator up to the first `yield`.
  - Arguments passed to `.next(val)` become the evaluated result of the `yield`
    expression where the generator was currently paused!
*/

console.log("=== 2. TWO-WAY COMMUNICATION ===");

function* conversationalBot(): Generator<string, void, string> {
    // 1. Emit greeting, wait for user's name
    const userName = yield "Hello! What is your name?";

    // 2. Emit personalized message, wait for user's favorite topic
    const topic = yield `Nice to meet you, ${userName}! What do you want to learn today?`;

    // 3. Final response using both injected values
    console.log(`[Bot] Great! Let's dive deep into "${topic}", ${userName}!`);
}

const bot = conversationalBot();

// First .next() starts the bot up to the 1st yield
const greeting = bot.next();
console.log("[Bot says]:", greeting.value); // "Hello! What is your name?"

// Second .next("Shuja") passes "Shuja" as the return value of the 1st yield
const followUp = bot.next("Shuja");
console.log("[Bot says]:", followUp.value); // "Nice to meet you, Shuja! What do you want to learn today?"

// Third .next("TypeScript Generators") supplies the topic
bot.next("TypeScript Generators");
console.log();


// ==========================================================================
// 3. TYPESCRIPT TYPING: Generator<TYield, TReturn, TNext>
// ==========================================================================
/*
  TypeScript provides a built-in generic interface:
  Generator<TYield, TReturn, TNext>

  - TYield:  The type of values produced by `yield` (received via `result.value` when `done: false`)
  - TReturn: The type of value returned by `return` (received when `done: true`)
  - TNext:   The type accepted by `.next(arg)` when resuming paused yields
*/

function* typedGenerator(): Generator<number, boolean, string> {
    // yields a number (10), receives a string ("hello") from .next("hello")
    const receivedString: string = yield 10;
    console.log(`[TypedGen] Received string from caller: "${receivedString}"`);

    // returns a boolean
    return true;
}

const typedGen = typedGenerator();
const firstYield = typedGen.next(); // { value: 10, done: false }
// typedGen.next(123); // TypeScript Error: Argument of type 'number' is not assignable to parameter of type 'string'
const finalReturn = typedGen.next("hello world"); // { value: true, done: true }


// ==========================================================================
// 4. REAL-WORLD PATTERN A: INFINITE LAZY SEQUENCES (ZERO MEMORY BLOAT)
// ==========================================================================
/*
  Because generators pause until asked for the next item, you can create
  INFINITE streams without crashing your application's memory!
*/

console.log("=== 3. INFINITE SEQUENCE GENERATOR ===");

function* idGenerator(prefix: string): Generator<string, void, void> {
    let id = 1;
    while (true) {
        yield `${prefix}-${id}`;
        id++;
    }
}

const userIdGen = idGenerator("USER");
console.log("Generated ID:", userIdGen.next().value); // USER-1
console.log("Generated ID:", userIdGen.next().value); // USER-2
console.log("Generated ID:", userIdGen.next().value); // USER-3

const orderIdGen = idGenerator("ORD");
console.log("Generated ID:", orderIdGen.next().value); // ORD-1
console.log("Generated ID:", orderIdGen.next().value); // ORD-2
console.log();


// ==========================================================================
// 5. REAL-WORLD PATTERN B: ON-DEMAND PAGINATION (LAZY STREAMING)
// ==========================================================================
/*
  Instead of fetching 10,000 records into memory all at once, a generator
  allows you to process and fetch data page-by-page as needed.
*/

console.log("=== 4. ON-DEMAND PAGINATED DATA STREAMING ===");

interface PageResult {
    pageNumber: number;
    items: string[];
}

// Simulated paginated API database
function fetchPageFromDb(page: number): PageResult | null {
    const database: Record<number, string[]> = {
        1: ["Apple", "Banana", "Cherry"],
        2: ["Dates", "Elderberry", "Fig"],
        3: ["Grape", "Honeydew"],
    };
    const items = database[page];
    return items ? { pageNumber: page, items } : null;
}

// Generator that streams individual items one at a time across pages:
function* streamAllItems(): Generator<string, void, void> {
    let currentPage = 1;

    while (true) {
        const pageData = fetchPageFromDb(currentPage);
        if (!pageData) {
            // No more pages in database
            break;
        }

        console.log(` [DB] Fetched page ${currentPage} from server`);
        for (const item of pageData.items) {
            yield item; // Yield items one-by-one to the consumer!
        }

        currentPage++;
    }
}

// Consumer only asks for 4 items total:
const itemStream = streamAllItems();
console.log("Requested item 1:", itemStream.next().value); // Fetches page 1 -> Apple
console.log("Requested item 2:", itemStream.next().value); // Banana (cached from page 1)
console.log("Requested item 3:", itemStream.next().value); // Cherry (cached from page 1)
console.log("Requested item 4:", itemStream.next().value); // Fetches page 2 -> Dates
// Notice: Page 3 is NEVER fetched because we stopped asking! That saves network & CPU.
console.log();


// ==========================================================================
// 6. GENERATORS ARE ITERABLES: for...of & SPREAD OPERATOR
// ==========================================================================
/*
  Any generator implements `Symbol.iterator`, meaning it works out of the box with:
  - `for...of` loops
  - Array spread `[...generator]`
  - Destructuring `const [first, second] = generator`

  NOTE: `for...of` automatically ignores the final `return` value and only
  iterates over `yield` values until `done: true`.
*/

console.log("=== 5. GENERATORS WITH for...of AND SPREAD ===");

function* fibonacciSequence(limit: number): Generator<number, void, void> {
    let prev = 0;
    let curr = 1;

    while (prev <= limit) {
        yield prev;
        const next = prev + curr;
        prev = curr;
        curr = next;
    }
}

// Using for...of (clean and declarative)
console.log("Fibonacci numbers <= 20 via for...of:");
for (const num of fibonacciSequence(20)) {
    console.log(` -> ${num}`);
}

// Spreading generator output into a standard Array
const fibArray = [...fibonacciSequence(30)];
console.log("Fibonacci Array via spread [...]:", fibArray);
console.log();


// ==========================================================================
// 7. DELEGATING GENERATORS: yield*
// ==========================================================================
/*
  `yield*` lets a generator delegate iteration to another generator or iterable.
*/

console.log("=== 6. GENERATOR DELEGATION WITH yield* ===");

function* taskGroupA(): Generator<string, void, void> {
    yield "Task A1: Setup DB";
    yield "Task A2: Run migrations";
}

function* taskGroupB(): Generator<string, void, void> {
    yield "Task B1: Seed test users";
    yield "Task B2: Start web server";
}

function* masterDeploymentPipeline(): Generator<string, void, void> {
    yield "Pipeline Initiated";
    yield* taskGroupA(); // Delegates execution to taskGroupA until it finishes
    yield* taskGroupB(); // Delegates execution to taskGroupB until it finishes
    yield "Pipeline Complete";
}

for (const step of masterDeploymentPipeline()) {
    console.log(`[Deployment] ${step}`);
}

console.log("\n--- Generator, Yield & Next: Demonstration Complete! ---");
