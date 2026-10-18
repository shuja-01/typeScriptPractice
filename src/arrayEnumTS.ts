/* ==========================================================================
   ARRAYS, TUPLES, AND ENUMS IN TYPESCRIPT
   ========================================================================== */

/*
  OVERVIEW:
  1. ARRAYS: An ordered collection of items, typically of the SAME type (e.g., numbers, strings, or objects).
  2. TUPLES: A specialized array with a FIXED length and FIXED types at each specific position (e.g., [number, string]).
  3. ENUMS:  A way to define a collection of named constants to replace "magic numbers" or "magic strings".
*/

// ==========================================================================
// 1. ARRAYS IN TYPESCRIPT
// ==========================================================================
/*
  WHY USE ARRAYS IN TYPESCRIPT?
  In vanilla JavaScript:
      let scores = [10, 20, "hello", true]; // JS allows anything!
  This leads to runtime bugs when trying to do math like scores[2] * 5.

  In TypeScript:
  TypeScript locks down the array element types so that only valid elements can be added.
*/

// --- (A) Basic Array Declarations ---
// Approach 1: Square bracket syntax (Recommended & most common)
let fruits: string[] = ["apple", "banana", "mango"];
fruits.push("orange"); // Valid
// fruits.push(100);   // Error: Argument of type 'number' is not assignable to 'string'

// Approach 2: Generic Array syntax
let marks: Array<number> = [95, 88, 76, 99];

// --- (B) Array of Objects ---
// Very common when handling data fetched from APIs
type Student = {
    id: number;
    name: string;
    isActive: boolean;
};

let studentList: Student[] = [
    { id: 1, name: "Shuja", isActive: true },
    { id: 2, name: "Hassan", isActive: false },
];

studentList.push({ id: 3, name: "Ali", isActive: true });

// --- (C) Union Type Arrays ---
// When an array can hold more than one specific type:
// Important distinction:
// - (string | number)[] : Array containing both strings AND numbers
// - string[] | number[] : The array is EITHER entirely strings OR entirely numbers
let mixedData: (string | number)[] = [1, "two", 3, "four"];
mixedData.push(5);       // Valid
mixedData.push("six");   // Valid
// mixedData.push(true); // Error: boolean not allowed

// --- (D) Multidimensional Arrays (Matrices / Grids) ---
// An array where each item is itself an array of numbers
let ticTacToeGrid: string[][] = [
    ["X", "O", "X"],
    ["O", "X", "O"],
    ["O", "O", "X"],
];

// --- (E) Readonly Arrays (Immutable Arrays) ---
// Prevents any modification (no .push(), .pop(), or index reassignment)
let immutableNumbers: readonly number[] = [10, 20, 30];
// immutableNumbers.push(40); // Error: Property 'push' does not exist on type 'readonly number[]'
// immutableNumbers[0] = 99;  // Error: Index signature in type only permits reading


// ==========================================================================
// 2. TUPLES IN TYPESCRIPT
// ==========================================================================
/*
  WHAT IS A TUPLE?
  A tuple is an array with:
  1. A FIXED number of elements.
  2. KNOWN types at specific index positions.

  WHY USE TUPLES?
  - Key-value pairs: e.g., ["username", 404]
  - Coordinate pairs: e.g., [latitude, longitude]
  - HTTP responses: e.g., [200, "OK"]
  - React's `useState`: e.g., [value, setValue]
*/

// --- (A) Basic Tuple ---
// Position 0 MUST be a number, Position 1 MUST be a string
let httpResponse: [number, string] = [200, "Success"];

httpResponse[0] = 404;         // Valid (number)
httpResponse[1] = "Not Found"; // Valid (string)
// httpResponse = ["OK", 200]; // Error: Wrong order! Type 'string' is not assignable to 'number'

// --- (B) Labeled Tuples (TypeScript 4.0+) ---
// Adding labels gives documentation and autocomplete in your IDE!
let coordinate: [latitude: number, longitude: number] = [28.6139, 77.2090];
let userRecord: [id: number, username: string, isVerified: boolean] = [101, "shuja", true];

// --- (C) Optional Elements in Tuples (`?`) ---
// Optional elements must be placed at the end of the tuple
type RgbOrRgba = [r: number, g: number, b: number, alpha?: number];

let redColor: RgbOrRgba = [255, 0, 0];                // Alpha omitted
let semiTransparentRed: RgbOrRgba = [255, 0, 0, 0.5]; // Alpha included

// --- (D) Rest Elements in Tuples ---
// A tuple where the first element is fixed, followed by any number of additional elements
type StringWithNumbers = [string, ...number[]];

let scoreSheet: StringWithNumbers = ["Math Exam", 88, 92, 79, 95];

// --- (E) The Tuple `.push()` Gotcha & Readonly Tuples ---
// Gotcha: In plain TypeScript tuples, JavaScript's `.push()` method is allowed,
// which can accidentally add elements beyond the intended tuple length!
let trickyTuple: [number, string] = [1, "One"];
trickyTuple.push("Sneaky element"); // TS allows this by default

// Solution: Use `readonly` to strictly lock the tuple from mutations:
let secureTuple: readonly [number, string] = [100, "Admin"];
// secureTuple.push(200); // Error: Property 'push' does not exist on type 'readonly [number, string]'


// ==========================================================================
// 3. ENUMS IN TYPESCRIPT
// ==========================================================================
/*
  WHAT IS AN ENUM?
  Enum (short for Enumeration) is a special feature in TypeScript that allows
  you to define a set of named, human-readable constants.

  WHY USE ENUMS?
  Without Enums (Using "Magic Strings/Numbers"):
      function setStatus(status: number) {
          if (status === 1) { ... } // What does 1 mean? Unclear!
      }

  With Enums:
      setStatus(OrderStatus.Shipped); // Crystal clear!
*/

// --- (A) Numeric Enums (Default: Auto-incrementing from 0) ---
enum Direction {
    Up,    // 0
    Down,  // 1
    Left,  // 2
    Right, // 3
}

let playerMove: Direction = Direction.Up; // Value is 0

// Custom starting value:
enum HttpStatus {
    Ok = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    InternalServerError = 500,
}

let responseCode: HttpStatus = HttpStatus.Ok; // 200

// Numeric Enums have "Reverse Mapping":
// You can look up the name of an enum member using its numeric value!
let statusName: string | undefined = HttpStatus[200]; // "Ok"
console.log(`Status 200 name is: ${statusName}`);


// --- (B) String Enums (Recommended for readability & debugging) ---
// Each member is assigned an explicit string value.
// String enums do NOT have reverse mapping, but they serialize cleanly in JSON / logs.
enum UserRole {
    Admin = "ADMIN",
    Editor = "EDITOR",
    Viewer = "VIEWER",
}

function checkAccess(role: UserRole): void {
    if (role === UserRole.Admin) {
        console.log("Full admin access granted.");
    } else {
        console.log(`Access restricted for role: ${role}`);
    }
}

checkAccess(UserRole.Admin); // Output: "Full admin access granted."

// --- (C) Const Enums (For Zero Runtime Overhead) ---
// Regular enums generate an actual JavaScript object at runtime.
// If you want TypeScript to inline the values directly into your compiled JS code
// without creating a JavaScript object, use `const enum`:
const enum OrderState {
    Pending = "PENDING",
    Processing = "PROCESSING",
    Delivered = "DELIVERED",
}

// In compiled JS, this compiles directly to: `let currentOrder = "DELIVERED";`
let currentOrder: OrderState = OrderState.Delivered;

// --- (D) Modern Alternative: `as const` Object (Union of Literals) ---
// Many modern TypeScript projects and codebases prefer this over enums
// because it is 100% standard JavaScript with TypeScript type safety:
const PaymentMethod = {
    CreditCard: "CREDIT_CARD",
    PayPal: "PAYPAL",
    UPI: "UPI",
} as const;

// Create a TypeScript type from the object values:
type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
// Equivalent to: type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "UPI"

let selectedPayment: PaymentMethod = PaymentMethod.UPI; // Valid


// ==========================================================================
// DEMONSTRATION & LOGGING
// ==========================================================================
console.log("--- Arrays ---");
console.log("Fruits:", fruits);
console.log("Students:", studentList);

console.log("\n--- Tuples ---");
console.log("HTTP Response Tuple:", httpResponse);
console.log("Coordinates:", coordinate);

console.log("\n--- Enums ---");
console.log("Direction.Up:", Direction.Up);
console.log("HttpStatus.NotFound:", HttpStatus.NotFound);
console.log("UserRole.Admin:", UserRole.Admin);
console.log("Current Order (const enum):", currentOrder);
console.log("Selected Payment (as const):", selectedPayment);

//=================================================
//=================================================
//from YT:

//basic syntax to declare array
const chaiFlavours: string[] = ["masala", "ginger", "cardmom", "plain"]
const chaiPrice: number[] = [10, 20]

// different way to declare arrays:
const rating: Array<number> = [4.5, 5.5]

//array of objects:

type Chai = {
    name: string;
    price: number
}
const menu: Chai[] = [
    { name: "Masala", price: 15 },
    { name: "Ginger", price: 20 }
]

//readonly arrays:
const cities: readonly string[] = ["Delhi", "Mumbai", "Kolkata", "Chennai"]
// cities.push("Raipur"); // it will throw an error 


//Multidimentional Arrays:
const ticTacToeBoard: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
ticTacToeBoard.push([10, 11, 12])


//TUPLES: can store different datatypes in same array but on specific position.
let chaiTuple: [string, number, boolean];
chaiTuple = ["masala", 25, true]
// chaiTuple = ["masala", 25, 43] // will throw an error because at 3rd position we have given boolean in type and number in value

let userInfo: [string, number, boolean?];
userInfo = ["Shubham", 24] // will work
userInfo = ["Shubham", 24, true] // also will work

//Named tuped : it is better approcah to define tuple, when we use it later in code we get the suggections, also it makes code more readable and understandable.
// it is a kind of documentation for tuple
const chaiItems: [name: string, price: number] = ["Masala", 25]


//ENUMS : It a feature in typescript which is used to define a set of named constants. It is a set of named constants.
enum Cupsize {
    SMALL,
    MEDIUM,
    LARGE
}
const size = Cupsize.LARGE; //will get suggestoin after "." operator.

//auto increament values in enums: it is only applicable for numeric enums.
//by default it starts from 0. but we can change it to anything.
enum status {
    pending = 100,
    served, // automatic 101
    cancelled // automatic 102
}
// as we create env variables and constants, there we use enums: 
enum ChaiTypes {
    MASALA = "Masala",
    GINGER = "Ginger",
    CARDMOM = "Cardmom"
}
function makeChai(type: ChaiTypes) {
    console.group(`Making: ${type}`);
}
makeChai(ChaiTypes.CARDMOM); // will get suggestoin after "." operator 

//heterogenous Enums: Not a good practice, can store different datatypes in same enum.
enum RandomEnum {
    ID = 1,
    NAME = "chai"
}