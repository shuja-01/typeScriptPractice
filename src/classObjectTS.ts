/* ==========================================================================
   CLASSES AND OBJECTS IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  ==========================================================================
  MENTAL MODEL: WHAT IS A CLASS VS AN OBJECT?
  ==========================================================================
  - CLASS:
    A Class is a *blueprint*, *template*, or *recipe*. It defines what properties
    (state) and methods (behavior) an entity will have. It takes up no runtime memory
    for data until an object is created.

  - OBJECT (INSTANCE):
    An Object is the *real-world manifestation* created from that blueprint using `new`.
    Each object has its own independent copy of state/data.

  Real-world analogy:
  - Class  = The architectural blueprint of a house.
  - Object = The actual physical house built on a plot of land with specific furniture.
*/


// ==========================================================================
// 1. BASIC CLASS DECLARATION & INSTANTIATION
// ==========================================================================

class CoffeeOrder {
    // 1. Field / Property declarations
    customerName: string;
    coffeeType: string;
    cups: number;
    isSugarFree: boolean;

    // 2. Constructor: The special initialization function called when using `new`
    constructor(customerName: string, coffeeType: string, cups: number, isSugarFree: boolean = false) {
        // `this` refers to the CURRENT instance being created
        this.customerName = customerName;
        this.coffeeType = coffeeType;
        this.cups = cups;
        this.isSugarFree = isSugarFree;
    }

    // 3. Instance Method: Action that each coffee order can perform
    calculateTotal(pricePerCup: number): number {
        return this.cups * pricePerCup;
    }

    getOrderSummary(pricePerCup: number): string {
        const total = this.calculateTotal(pricePerCup);
        const sugarText = this.isSugarFree ? "Sugar-Free" : "Standard Sugar";
        return `Order for ${this.customerName}: ${this.cups}x ${this.coffeeType} (${sugarText}) - Total: $${total}`;
    }
}

// Instantiating objects using the `new` keyword:
const order1 = new CoffeeOrder("Shuja", "Cappuccino", 2);
const order2 = new CoffeeOrder("Hassan", "Espresso", 1, true);

console.log(order1.getOrderSummary(4.5));
console.log(order2.getOrderSummary(3.0));


// ==========================================================================
// 2. TYPESCRIPT'S DUAL NATURE: CLASS AS A "TYPE" AND AS A "VALUE"
// ==========================================================================
/*
  In TypeScript, when you declare `class Car {}`, TypeScript creates TWO things:
  1. A VALUE: The constructor function `Car` stored in runtime memory.
  2. A TYPE:  The interface/shape of an instance `Car` used for type-checking.
*/

class Point2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

// Point2D used as a VALUE (instantiation):
const pt1 = new Point2D(10, 20);

// Point2D used as a TYPE (type annotation):
function calculateDistance(point: Point2D): number {
    return Math.sqrt(point.x * point.x + point.y * point.y);
}

// Structural Typing (Duck Typing):
// Because TypeScript is structurally typed, ANY object with matching shapes (x: number, y: number)
// can satisfy the `Point2D` type without using `new Point2D()`!
const rawPointObject: Point2D = { x: 3, y: 4 };
console.log(`Distance from origin: ${calculateDistance(rawPointObject)}`); // Works!


// ==========================================================================
// 3. PROPERTY INITIALIZATION PATTERNS
// ==========================================================================

class Profile {
    // A. Inline default initialization
    role: string = "Member";

    // B. Initialized via constructor
    username: string;

    // C. Optional property (`?`): May be undefined
    bio?: string;

    // D. Readonly property: Cannot be modified after initialization
    readonly createdAt: Date = new Date();

    constructor(username: string, bio?: string) {
        this.username = username;
        if (bio) {
            this.bio = bio;
        }
    }
}

const userProfile = new Profile("shuja_dev", "Full-stack engineer & TS enthusiast");
console.log(`User: ${userProfile.username}, Role: ${userProfile.role}, Bio: ${userProfile.bio}`);
// userProfile.createdAt = new Date(); // Error: Cannot assign to 'createdAt' because it is read-only


// ==========================================================================
// 4. CONSTRUCTOR OVERLOADING (MULTIPLE WAYS TO INITIALIZE AN OBJECT)
// ==========================================================================
/*
  TypeScript allows you to define multiple constructor signatures to let users
  create objects in different ways, followed by a single implementation.
*/

class DateRange {
    startDate: Date;
    endDate: Date;

    // Overload 1: Create range using Date objects
    constructor(start: Date, end: Date);

    // Overload 2: Create range using ISO date strings
    constructor(startStr: string, endStr: string);

    // Overload 3: Create range from today for N number of days
    constructor(daysFromNow: number);

    // Constructor Implementation (handles all overload signatures)
    constructor(param1: Date | string | number, param2?: Date | string) {
        if (param1 instanceof Date && param2 instanceof Date) {
            this.startDate = param1;
            this.endDate = param2;
        } else if (typeof param1 === "string" && typeof param2 === "string") {
            this.startDate = new Date(param1);
            this.endDate = new Date(param2);
        } else if (typeof param1 === "number") {
            this.startDate = new Date();
            this.endDate = new Date(Date.now() + param1 * 24 * 60 * 60 * 1000);
        } else {
            throw new Error("Invalid constructor parameters for DateRange");
        }
    }

    printRange(): void {
        console.log(`Range: ${this.startDate.toISOString().split("T")[0]} to ${this.endDate.toISOString().split("T")[0]}`);
    }
}

const rangeFromStrings = new DateRange("2026-01-01", "2026-01-10");
const rangeFromDays = new DateRange(7); // Next 7 days from now
rangeFromStrings.printRange();
rangeFromDays.printRange();


// ==========================================================================
// 5. PARAMETER PROPERTIES (CONCISE CONSTRUCTOR BOILERPLATE)
// ==========================================================================
/*
  Writing `this.x = x` for 5-10 properties is tedious.
  By placing access modifiers (`public`, `private`, `protected`, `readonly`)
  directly in the constructor parameter list, TypeScript automatically declares
  and assigns the class properties!
*/

class Vehicle {
    constructor(
        public brand: string,
        public model: string,
        private engineCode: string,
        readonly year: number
    ) {
        // Nothing needed here! TypeScript auto-creates:
        // this.brand, this.model, this.engineCode, this.year
    }

    public getVehicleInfo(): string {
        return `${this.year} ${this.brand} ${this.model} [Engine: ${this.engineCode}]`;
    }
}

const myCar = new Vehicle("Toyota", "Camry", "V6-9921", 2024);
console.log(myCar.getVehicleInfo());


// ==========================================================================
// 6. GETTERS AND SETTERS (CONTROLLED DATA ACCESS & COMPUTED PROPERTIES)
// ==========================================================================
/*
  Getters (`get`) and Setters (`set`) let you define properties that look like
  normal fields from the outside, but run custom validation/calculation logic inside.
*/

class Temperature {
    private _celsius: number;

    constructor(celsius: number) {
        this._celsius = celsius;
    }

    // Getter for Celsius
    get celsius(): number {
        return this._celsius;
    }

    // Setter for Celsius with validation (Cannot go below Absolute Zero)
    set celsius(value: number) {
        if (value < -273.15) {
            throw new Error("Temperature below absolute zero (-273.15°C) is impossible!");
        }
        this._celsius = value;
    }

    // Computed Getter: Fahrenheit is computed dynamically on the fly!
    get fahrenheit(): number {
        return (this._celsius * 9) / 5 + 32;
    }

    // Setter for Fahrenheit: converts and updates the internal Celsius value!
    set fahrenheit(fValue: number) {
        this.celsius = ((fValue - 32) * 5) / 9;
    }
}

const temp = new Temperature(25);
console.log(`25°C in Fahrenheit is: ${temp.fahrenheit}°F`); // 77°F
temp.fahrenheit = 212; // Boiling point of water
console.log(`212°F in Celsius is: ${temp.celsius}°C`);      // 100°C


// ==========================================================================
// 7. PRO PATTERN 1: METHOD CHAINING (FLUENT API / BUILDER PATTERN)
// ==========================================================================
/*
  Method Chaining allows calling multiple methods in a single, readable line
  by returning `this` (the current object instance) from each method.
*/

class QueryBuilder {
    private table: string = "";
    private conditions: string[] = [];
    private fields: string[] = ["*"];
    private rowLimit?: number;

    from(table: string): this {
        this.table = table;
        return this; // Return current instance for chaining
    }

    select(...fields: string[]): this {
        this.fields = fields;
        return this;
    }

    where(condition: string): this {
        this.conditions.push(condition);
        return this;
    }

    limit(count: number): this {
        this.rowLimit = count;
        return this;
    }

    build(): string {
        let sql = `SELECT ${this.fields.join(", ")} FROM ${this.table}`;
        if (this.conditions.length > 0) {
            sql += ` WHERE ${this.conditions.join(" AND ")}`;
        }
        if (this.rowLimit !== undefined) {
            sql += ` LIMIT ${this.rowLimit}`;
        }
        return `${sql};`;
    }
}

// Fluent chaining in action:
const userQuery = new QueryBuilder()
    .from("users")
    .select("id", "username", "email")
    .where("isActive = true")
    .where("age >= 18")
    .limit(10)
    .build();

console.log("Generated SQL:", userQuery);


// ==========================================================================
// 8. PRO PATTERN 2: STATIC FACTORY METHODS (BETTER THAN OVERLOADS)
// ==========================================================================
/*
  Instead of having complex constructor parameters, Static Factory Methods
  provide named functions on the class that produce specialized instances.
*/

class AppUser {
    private constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly role: "admin" | "customer" | "guest"
    ) { }

    // Factory method 1: Create a normal customer
    public static createCustomer(id: string, email: string): AppUser {
        return new AppUser(id, email, "customer");
    }

    // Factory method 2: Create a guest user (anonymous)
    public static createGuest(): AppUser {
        const guestId = `guest_${Math.floor(Math.random() * 10000)}`;
        return new AppUser(guestId, "guest@local", "guest");
    }

    // Factory method 3: Create from raw API JSON data
    public static fromJSON(json: { id: string; email: string; role: "admin" | "customer" | "guest" }): AppUser {
        return new AppUser(json.id, json.email.toLowerCase().trim(), json.role);
    }
}

const customer = AppUser.createCustomer("cust_1", "user@example.com");
const guest = AppUser.createGuest();
console.log("Customer User:", customer);
console.log("Guest User:", guest);


// ==========================================================================
// 9. PRO PATTERN 3: THE SINGLETON PATTERN
// ==========================================================================
/*
  The Singleton Pattern ensures a class has ONLY ONE instance across the entire
  application, providing a global point of access (e.g., Database connection, App Config).
*/

class AppConfig {
    // 1. Static private variable holding the single unique instance
    private static instance: AppConfig | null = null;

    // 2. State held by this singleton
    public appName: string = "TypeScriptMastery";
    public version: string = "1.0.0";
    public isProduction: boolean = false;

    // 3. Private constructor: PREVENTS anyone from doing `new AppConfig()` outside!
    private constructor() {
        console.log("AppConfig instance initialized.");
    }

    // 4. Static method to access the single shared instance
    public static getInstance(): AppConfig {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }
}

// const directConfig = new AppConfig(); // Error: Constructor of class 'AppConfig' is private
const config1 = AppConfig.getInstance();
const config2 = AppConfig.getInstance();

// Both variables point to the EXACT same memory location:
console.log("Are config1 and config2 the same instance?", config1 === config2); // true
config1.isProduction = true;
console.log("config2 sees the update:", config2.isProduction); // true


// ==========================================================================
// 10. STRUCTURAL VS NOMINAL TYPING QUIRK IN CLASSES
// ==========================================================================
/*
  - Two classes with IDENTICAL PUBLIC fields are considered compatible in TypeScript
    because TypeScript uses Structural Typing.
  - BUT if either class has a `private` or `protected` field, TypeScript enforces
    Nominal Typing: they are NO LONGER compatible!
*/

class Dog {
    constructor(public name: string) { }
}

class Cat {
    constructor(public name: string) { }
}

let animal: Dog = new Cat("Milo"); //  Allowed! Both have identical public shape { name: string }

class SecureWallet {
    private secretSeed: string = "12345";
    constructor(public balance: number) { }
}

class FakeWallet {
    private secretSeed: string = "12345";
    constructor(public balance: number) { }
}

let wallet1: SecureWallet = new SecureWallet(500);
// let wallet2: SecureWallet = new FakeWallet(500); 
// Error: Types have separate declarations of a private property 'secretSeed'
// TypeScript protects private fields from structural substitution!
