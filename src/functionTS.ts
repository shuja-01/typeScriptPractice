/* ==========================================================================
   FUNCTIONS IN TYPESCRIPT
   ========================================================================== */

/* 
  WHY DO WE USE FUNCTIONS IN TYPESCRIPT?
  --------------------------------------
  1. Type Safety: TypeScript checks parameter types and return types at compile-time, preventing common runtime errors (e.g., passing a string where a number is expected).
  2. Clear Contracts & Autocomplete: When calling a function, your editor shows the exact required parameters, their types, and the expected return type.
  3. Safe Refactoring: If you change a function signature, TypeScript flags all places in your codebase that need to be updated.
  4. Code Reusability & Modularity: Encapsulate and organize reusable logic with guaranteed predictability.

  HOW DO WE USE FUNCTIONS IN TYPESCRIPT?
  --------------------------------------
  We define:
  1. Parameter types: (paramName: ParamType)
  2. Return type: function name(...): ReturnType { ... }
*/

// ==========================================================================
// 1. BASIC SYNTAX
// ==========================================================================
// Syntax:
// function functionName(param1: Type1, param2: Type2): ReturnType {
//     return result;
// }

function add(a: number, b: number): number {
    return a + b;
}

// Return type void: Used when a function returns no value
function logMessage(message: string): void {
    console.log(`[LOG]: ${message}`);
}

// Return type never: For functions that NEVER finish normally (e.g. throw an error or infinite loop)
function throwError(errMsg: string): never {
    throw new Error(errMsg);
}

// ==========================================================================
// 2. TYPES / WAYS OF DEFINING FUNCTIONS IN TYPESCRIPT
// ==========================================================================

// --- Type 1: Named Function (Function Declaration) ---
// Hoisted to top of scope, classic function declaration
function greetUser(name: string): string {
    return `Hello, ${name}!`;
}

// --- Type 2: Function Expression (Anonymous Function assigned to variable) ---
const multiply = function (x: number, y: number): number {
    return x * y;
};

// --- Type 3: Arrow Functions (Deep Dive & Comprehensive Guide) ---
/*
  WHAT IS AN ARROW FUNCTION?
  - Introduced in ES6, arrow functions provide a compact syntax using `=>` (fat arrow).
  - They are always function expressions (assigned to variables or passed inline).
  - Key feature: Lexical `this` binding (they do NOT create their own `this`, `arguments`, or `prototype`).

  SYNTAX FORMATS:
  1. Block body (explicit return):   (params): ReturnType => { return value; }
  2. Concise body (implicit return): (params): ReturnType => expression
*/

// Example 3.1: Explicit Return (with curly braces `{}` and `return` keyword)
// Use this when your function has multiple statements, calculations, or logging.
const subtract = (x: number, y: number): number => {
    const result = x - y;
    return result;
};

// Example 3.2: Implicit Return (One-liner / concise body)
// When there is only ONE expression, omit `{}` and `return`. The result is returned automatically.
const square = (n: number): number => n * n;

// Example 3.3: Implicitly Returning an Object Literal (Common Gotcha!)
// In JavaScript/TypeScript, `{}` is interpreted as a code block by default.
// To return an object directly without `return`, wrap the object in parentheses `(...)`:
const createPerson = (name: string, age: number): { name: string; age: number } => ({
    name,
    age,
});

// Example 3.4: Parameter Variations
// - No parameters: must use empty parentheses `()`
const getCurrentTimestamp = (): number => Date.now();

// - Single parameter: in TypeScript, still requires parentheses `(x: type)` for type annotations
const doubleValue = (val: number): number => val * 2;

// - Multiple parameters with an optional parameter (`?`):
const greetPerson = (firstName: string, lastName?: string): string =>
    lastName ? `Hello, ${firstName} ${lastName}` : `Hello, ${firstName}`;

// Example 3.5: Contextual Typing (Typing the variable instead of typing parameters inline)
// You can define a reusable function type alias first. TypeScript will automatically infer
// the parameter types `a` and `b` on the right side!
type MathCalculation = (a: number, b: number) => number;

const divideNumbers: MathCalculation = (a, b) => {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
};

// Example 3.6: Lexical `this` Binding (Why Arrow Functions are powerful)
// Regular functions create their own `this` dynamically depending on how they are called.
// Arrow functions capture `this` from their enclosing lexical context (outer scope).
const counterObject = {
    count: 0,
    start() {
        // Inside setTimeout, an arrow function keeps `this` pointing to `counterObject`:
        setTimeout(() => {
            this.count++;
            console.log(`Updated count: ${this.count}`);
        }, 500);
    },
};

// Example 3.7: Arrow Functions as Inline Callbacks
// Commonly used with array methods like .map(), .filter(), and .reduce()
const rawNumbers: number[] = [1, 2, 3, 4, 5];
const evenNumbers: number[] = rawNumbers.filter((num: number): boolean => num % 2 === 0);
const multiplied: number[] = rawNumbers.map((num) => num * 10); // Type inferred automatically

// Example 3.8: Generic Arrow Function
// Generic functions work with any type while maintaining strict type safety.
// Syntax: <T>(param: T): ReturnType => ...
const wrapInList = <T>(item: T): T[] => [item];

const numList = wrapInList(42);         // Inferred as number[]
const strList = wrapInList("TypeScript"); // Inferred as string[]


// --- Type 4: Functions with Optional Parameters (`?`) ---
// Note: Optional parameters must always come AFTER required parameters
function introduce(name: string, age?: number): string {
    if (age !== undefined) {
        return `Hi, I am ${name} and I am ${age} years old.`;
    }
    return `Hi, I am ${name}.`;
}

// --- Type 5: Functions with Default Parameters ---
// If caller omits the argument, the default value is used
function calculateDiscount(price: number, discountPercentage: number = 10): number {
    return price - (price * discountPercentage) / 100;
}

// --- Type 6: Functions with Rest Parameters (`...args`) ---
// Collects any number of arguments into a typed array
function sumAllNumbers(...numbers: number[]): number {
    return numbers.reduce((total, current) => total + current, 0);
}

// --- Type 7: Function Type Expressions & Type Aliases ---
// Define a reusable blueprint/signature for a function
type MathOperation = (a: number, b: number) => number;

const divide: MathOperation = (a, b) => {
    if (b === 0) {
        throw new Error("Division by zero is not allowed.");
    }
    return a / b;
};

// Can also be defined using a Callable Interface
interface Formatter {
    (input: string): string;
}

const uppercaseFormatter: Formatter = (text) => text.toUpperCase();

// --- Type 8: Higher-Order Functions & Callbacks ---
// Functions that take other functions as parameters or return functions
function processArray(
    items: number[],
    transformer: (num: number) => number
): number[] {
    return items.map(transformer);
}

const doubled = processArray([1, 2, 3], (n) => n * 2);

// --- Type 9: Function Overloading ---
// Allows a function to accept different combinations/types of arguments
// 1. Write the overload signatures (without function bodies):
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: boolean): string;
// 2. Write the single implementation signature (must be compatible with all overloads):
function formatValue(value: string | number | boolean): string {
    if (typeof value === "string") {
        return `String: "${value.trim()}"`;
    } else if (typeof value === "number") {
        return `Number: ${value.toFixed(2)}`;
    } else {
        return `Boolean: ${value ? "TRUE" : "FALSE"}`;
    }
}

// --- Type 10: Generic Functions ---
// Reusable across different types without losing type safety
function getFirstElement<T>(elements: T[]): T | undefined {
    return elements[0];
}

const firstNumber = getFirstElement([10, 20, 30]); // type is number | undefined
const firstString = getFirstElement(["apple", "banana"]); // type is string | undefined

// --- Type 11: Async Functions ---
// Functions that return a Promise with a specified resolved type
async function fetchUserData(userId: number): Promise<{ id: number; name: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: userId, name: "Shuja" });
        }, 100);
    });
}

// Demonstration calls (optional):
console.log(greetUser("Shuja"));
console.log(`Add: ${add(5, 10)}`);
console.log(`Discounted price: $${calculateDiscount(100)}`);
console.log(`Sum of all: ${sumAllNumbers(1, 2, 3, 4, 5)}`);
console.log(`Divide: ${divide(20, 4)}`);
console.log(`Overloaded formatted number: ${formatValue(42.5)}`);
console.log(`First element: ${getFirstElement(["TypeScript", "JavaScript"])}`);

