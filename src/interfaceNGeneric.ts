/* ==========================================================================
   INTERFACES, GENERICS, AND "INTERFACE VS TYPE" IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  ==========================================================================
  QUICK EXECUTIVE OVERVIEW:
  ==========================================================================
  1. INTERFACE: A structural contract defining the shape of an object or class.
  2. GENERICS:  Type variables (<T>) that let you write reusable, adaptable code
                without sacrificing type safety (like parameters for your types!).
  3. INTERFACE vs TYPE:
     - Use `interface` for object shapes, class blueprints, and public APIs (allows declaration merging).
     - Use `type` for unions, primitives, tuples, and complex type manipulations.
*/

// ==========================================================================
// PART 1: INTERFACES (BASIC TO PRO)
// ==========================================================================

/*
  An Interface acts as a contract. If an object or class signs this contract,
  it guarantees it has the exact properties and methods defined.
*/

// --- 1.1 Basic Interface & Modifiers ---
interface Laptop {
    readonly serialNumber: string; // Cannot be changed after creation
    brand: string;
    ramGB: number;
    hasSSD?: boolean; // Optional property (may be undefined)
}

const myLaptop: Laptop = {
    serialNumber: "SN-98214-XYZ",
    brand: "Dell",
    ramGB: 16,
    hasSSD: true,
};

// myLaptop.serialNumber = "NEW-SN"; //  Error: Cannot assign to 'serialNumber' because it is read-only.
console.log(`Laptop: ${myLaptop.brand} with ${myLaptop.ramGB}GB RAM`);


// --- 1.2 Methods inside Interfaces ---
interface MediaController {
    currentVolume: number;
    play(): void;
    pause(): void;
    setVolume(level: number): boolean; // Method with parameter and return type
}

const audioPlayer: MediaController = {
    currentVolume: 50,
    play() {
        console.log("Audio playing...");
    },
    pause() {
        console.log("Audio paused.");
    },
    setVolume(level: number): boolean {
        if (level >= 0 && level <= 100) {
            this.currentVolume = level;
            return true;
        }
        return false;
    },
};

audioPlayer.play();
audioPlayer.setVolume(75);
console.log(`Current Volume: ${audioPlayer.currentVolume}`);


// --- 1.3 Index Signatures (Dynamic Keys) ---
// Used when you don't know all property names in advance (e.g. dictionary / cache)
interface ErrorMap {
    [errorCode: string]: string; // Key is string, value is string
}

const apiErrors: ErrorMap = {
    ERR_404: "Resource Not Found",
    ERR_500: "Internal Server Error",
    ERR_AUTH: "Token Expired",
};
console.log(`Error 404 message: ${apiErrors["ERR_404"]}`);


// --- 1.4 Interface Inheritance (`extends`) ---
// Interfaces can inherit from one or more other interfaces, creating clean hierarchies
interface BaseUser {
    id: number;
    username: string;
    email: string;
}

interface SuperAdmin extends BaseUser {
    permissions: string[];
    canDeleteUsers: boolean;
}

const adminUser: SuperAdmin = {
    id: 1,
    username: "super_admin",
    email: "admin@corp.internal",
    permissions: ["READ", "WRITE", "DELETE", "AUDIT"],
    canDeleteUsers: true,
};
console.log(`Admin ${adminUser.username} has ${adminUser.permissions.length} permissions.`);


// ==========================================================================
// PART 2: GENERICS (BASIC TO PRO)
// ==========================================================================

/*
  WHAT PROBLEM DO GENERICS SOLVE?
  Suppose you write a function that returns the first element of an array:
  - If you type it as `number[] => number`, it only works for numbers.
  - If you type it as `any[] => any`, you LOSE all type safety and autocomplete!
  - Generics (<T>) solve this by capturing the EXACT type passed in and preserving it!
*/

// --- 2.1 Basic Generic Function ---
// <T> is a placeholder (Type Parameter) representing any type
function getFirstElement<T>(items: T[]): T | undefined {
    return items[0];
}

const numArr = [10, 20, 30];
const firstNum = getFirstElement(numArr); // Inferred as: number | undefined

const strArr = ["apple", "banana", "mango"];
const firstStr = getFirstElement(strArr); // Inferred as: string | undefined

console.log(`First number: ${firstNum}, First string: ${firstStr}`);


// --- 2.2 Multiple Type Parameters ---
function createPair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

const pair1 = createPair("UserID", 501);           // [string, number]
const pair2 = createPair(true, { status: "OK" }); // [boolean, { status: string }]
console.log("Created pair:", pair1);


// --- 2.3 Generic Interfaces (Real-World API Responses) ---
// Essential pattern in modern web apps for standardized network payloads
interface ApiResponse<TData> {
    status: number;
    success: boolean;
    data: TData;         // The payload type changes dynamically!
    timestamp: Date;
}

type UserPayload = { name: string; role: string };
type ProductPayload = { title: string; price: number };

const userResponse: ApiResponse<UserPayload> = {
    status: 200,
    success: true,
    data: { name: "Shuja", role: "Developer" },
    timestamp: new Date(),
};

const productResponse: ApiResponse<ProductPayload[]> = {
    status: 200,
    success: true,
    data: [
        { title: "Mechanical Keyboard", price: 120 },
        { title: "Ergonomic Mouse", price: 85 },
    ],
    timestamp: new Date(),
};

console.log(`User Response Data Name: ${userResponse.data.name}`);
console.log(`Products Count: ${productResponse.data.length}`);


// --- 2.4 Generic Constraints (`extends`) ---
// You can restrict what types <T> can be by specifying a minimum required shape!

interface HasLength {
    length: number;
}

// <T extends HasLength> guarantees that whatever T is, it MUST have a .length property!
function logLength<T extends HasLength>(item: T): void {
    console.log(`Length is: ${item.length}`);
}

logLength("Hello TypeScript!");  //  Valid (strings have .length)
logLength([1, 2, 3, 4, 5]);      //  Valid (arrays have .length)
logLength({ length: 42, custom: "yes" }); //  Valid
// logLength(12345);             // Error: Argument of type 'number' is not assignable to 'HasLength'


// --- 2.5 Pro Generics: `keyof` Constraint ---
// Ensures that a key exists on the provided object at compile time!
function getObjectProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const car = { make: "Tesla", model: "Model 3", year: 2024 };
const carModel = getObjectProperty(car, "model"); // Type is automatically string!
const carYear = getObjectProperty(car, "year");   // Type is automatically number!
// const invalid = getObjectProperty(car, "color"); // Error: Argument of type '"color"' is not assignable to '"make" | "model" | "year"'

console.log(`Car: ${carModel} (${carYear})`);


// --- 2.6 Generic Classes (Data Structures) ---
class StorageBox<T> {
    private contents: T[] = [];

    push(item: T): void {
        this.contents.push(item);
    }

    pop(): T | undefined {
        return this.contents.pop();
    }

    getAll(): T[] {
        return this.contents;
    }
}

const numberBox = new StorageBox<number>();
numberBox.push(100);
numberBox.push(200);
console.log("Storage Box contents:", numberBox.getAll());


// ==========================================================================
// PART 3: "INTERFACE" VS "TYPE" (THE DEFINITIVE COMPARISON)
// ==========================================================================

/*
  ==========================================================================
  COMPARISON TABLE
  ==========================================================================
  Feature                   | `interface`                     | `type` (Type Alias)
  --------------------------------------------------------------------------
  1. Primary Purpose        | Defining Object/Class Shapes    | Any type definition
  2. Primitives & Unions    | CANNOT define unions/primitives |  CAN define: `type ID = string | number`
  3. Tuples                 | Awkward/not natural             |  Native: `type Tuple = [string, number]`
  4. Declaration Merging    |  YES (Auto-merges same name)    |  NO (Throws duplicate identifier)
  5. Extension Syntax       | `extends` keyword               | `&` (Intersection)
  6. Implemented by Classes |  YES                            |  YES (for object shapes)
  7. Compiler Performance   | Slightly faster (cached names)  | Evaluated recursively
  --------------------------------------------------------------------------
*/

// --- Difference 1: Declaration Merging (Re-opening) ---
// Interfaces with the same name in the same scope AUTOMATICALLY MERGE into one!
// This is essential for augmenting 3rd-party libraries or window/Node globals.

interface Customer {
    name: string;
}

// Re-opening the Customer interface:
interface Customer {
    membershipTier: string;
}

// The resulting Customer requires BOTH `name` AND `membershipTier`:
const customerOne: Customer = {
    name: "Aisha",
    membershipTier: "Gold",
};
console.log(`Customer: ${customerOne.name} [Tier: ${customerOne.membershipTier}]`);

// With `type`, declaration merging is an ERROR:
type Animal = { name: string };
// type Animal = { legs: number }; // Error: Duplicate identifier 'Animal'.


// --- Difference 2: Unions, Primitives, and Tuples ---
// `type` can do things that `interface` simply CANNOT do:

// A. Union Types (NOT possible with interface):
type Status = "Pending" | "In_Progress" | "Completed" | "Failed";
type PrimitiveId = string | number;

// B. Tuples (NOT possible cleanly with interface):
type GeoCoordinate = [latitude: number, longitude: number];

// C. Mapped Types (NOT possible with interface):
type Keys = "email" | "phone";
type ContactInfo = {
    [K in Keys]?: string;
};

const myContact: ContactInfo = { email: "contact@example.com" };


// --- Difference 3: Extending via `extends` vs Intersections (`&`) ---

// Interface uses `extends` (clean, error messages are very descriptive):
interface VehicleBase {
    wheels: number;
}
interface ElectricCar extends VehicleBase {
    batteryCapacityKWh: number;
}

// Type uses Intersection `&`:
type EngineBase = { horsepower: number };
type HybridCar = EngineBase & { batteryCapacityKWh: number };

const prius: HybridCar = {
    horsepower: 150,
    batteryCapacityKWh: 8.8,
};
console.log(`Hybrid Horsepower: ${prius.horsepower}HP`);


// ==========================================================================
// WHEN TO USE WHICH? (BEST PRACTICES & RULE OF THUMB)
// ==========================================================================
/*
  🎯 USE `interface` WHEN:
  1. You are designing public APIs, libraries, or SDKs that consumers might need to extend (via declaration merging).
  2. You are modeling objects or class blueprints with `implements`.
  3. You want the best possible compiler type-checking performance.

  🎯 USE `type` WHEN:
  1. You need Union types (`string | number`).
  2. You need Primitives aliases (`type Currency = string`).
  3. You are creating Tuples (`[number, string]`).
  4. You are building advanced types (Mapped types, Conditional types, Template literal types).
*/

console.log("\n--- Interface, Generics & Types Demo Complete! ---");
