/* ==========================================================================
   "this" AND "constructor" IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  ==========================================================================
  WHAT ARE "this" AND "constructor"?
  ==========================================================================
  - constructor:
    A special lifecycle method inside a class that executes automatically
    when creating a new instance using the `new` keyword. Its main job is to
    initialize the object's properties.

  - this:
    A keyword that refers to the CURRENT execution context (usually the specific
    object instance that invoked the method or accessed the property).
*/


// ==========================================================================
// SECTION 1: CONSTRUCTOR FUNDAMENTALS (BASIC TO INTERMEDIATE)
// ==========================================================================

/*
  Step-by-step of what happens when you write `new User("Shuja")`:
  1. JavaScript creates a new blank object `{}` in memory.
  2. Sets `this` to point to that new blank object.
  3. Executes the class's `constructor` function with passed arguments.
  4. Automatically returns `this` (unless the constructor explicitly returns another object).
*/

// --- (A) Standard Constructor vs Parameter Properties ---

// Standard (Verbose) Way:
class StandardUser {
    name: string;
    email: string;

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }
}

// TypeScript Parameter Properties (Pro Shorthand):
class CleanUser {
    // Adding `public`, `private`, `protected`, or `readonly` directly in the
    // constructor automatically declares and initializes the property!
    constructor(
        public name: string,
        public email: string,
        readonly createdAt: Date = new Date() // Default parameter in constructor
    ) { }
}

const userObj = new CleanUser("Shuja", "shuja@example.com");
console.log(`CleanUser created: ${userObj.name} at ${userObj.createdAt.toISOString()}`);


// --- (B) Constructors in Inheritance & the `super()` Rule ---
/*
  CRITICAL RULE:
  In a derived (child) class, if you write a constructor, you MUST call `super()`
  BEFORE accessing `this`. If you don't, TypeScript will throw a compile error:
  "Must call super constructor before accessing 'this'".
*/

class Device {
    constructor(public brand: string, public model: string) {
        console.log(`[Device Constructor] Initializing ${brand} ${model}`);
    }

    turnOn(): void {
        console.log(`${this.brand} ${this.model} is now powered on.`);
    }
}

class Smartphone extends Device {
    constructor(brand: string, model: string, public simSlots: number) {
        // 1. MUST call super() first to let parent initialize
        super(brand, model);

        // 2. ONLY now can you use `this` safely!
        console.log(`[Smartphone Constructor] SIM slots: ${this.simSlots}`);
    }
}

const phone = new Smartphone("Apple", "iPhone 15", 2);
phone.turnOn();


// --- (C) Constructor Overloading ---
/*
  Just like functions, constructors can have multiple signatures for flexible
  initialization, followed by ONE single implementation.
*/

class RectangularBox {
    width: number;
    height: number;

    // Overload 1: Square (single dimension)
    constructor(side: number);

    // Overload 2: Rectangle (two dimensions)
    constructor(width: number, height: number);

    // Implementation constructor:
    constructor(dim1: number, dim2?: number) {
        this.width = dim1;
        this.height = dim2 !== undefined ? dim2 : dim1;
    }

    getArea(): number {
        return this.width * this.height;
    }
}

const squareBox = new RectangularBox(5);     // Square: 5 x 5 = 25
const rectBox = new RectangularBox(4, 8);    // Rectangle: 4 x 8 = 32
console.log(`Square Area: ${squareBox.getArea()}, Rectangle Area: ${rectBox.getArea()}`);


// --- (D) Private & Protected Constructors (Pro Pattern) ---
/*
  1. `private constructor`: The class CANNOT be instantiated with `new` from outside.
     Used for Singletons and Static Factory patterns.
  2. `protected constructor`: The class CANNOT be instantiated directly, but CAN be
     instantiated via subclass constructors.
*/

// Private Constructor (Singleton Pattern):
class DatabaseConnection {
    private static instance: DatabaseConnection | null = null;

    // Private constructor blocks `new DatabaseConnection()`
    private constructor(private connectionString: string) {
        console.log(`Connected to DB: ${this.connectionString}`);
    }

    public static getConnection(connStr: string = "postgres://localhost:5432"): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection(connStr);
        }
        return DatabaseConnection.instance;
    }
}

const db = DatabaseConnection.getConnection();


// Protected Constructor (Base-Only Class):
class BaseEntity {
    // Protected constructor: cannot do `new BaseEntity()`, but subclasses can!
    protected constructor(public id: string) { }
}

class CustomerEntity extends BaseEntity {
    constructor(id: string, public name: string) {
        super(id); // Subclass can call protected constructor
    }
}

// const b = new BaseEntity("1"); // Error: Constructor of class 'BaseEntity' is protected
const cust = new CustomerEntity("CUST-100", "Ali");
console.log(`Customer: ${cust.name} (ID: ${cust.id})`);


// ==========================================================================
// SECTION 2: THE "this" KEYWORD (BASIC TO PRO)
// ==========================================================================

/*
  HOW "this" WORKS IN JAVASCRIPT & TYPESCRIPT:
  In JavaScript, `this` is NOT fixed by where a function is declared;
  it is determined by HOW and WHERE the function is CALLED (Call-site binding).
*/

// --- (A) The Infamous "Losing `this`" Problem ---

class SimpleTimer {
    seconds: number = 0;

    // Regular Method: `this` depends on who calls it
    tick(): void {
        this.seconds++;
        console.log(`Tick: ${this.seconds}`);
    }

    // Arrow Function Property: `this` is lexically bound to the instance at creation!
    tickArrow = (): void => {
        this.seconds++;
        console.log(`Tick (Arrow): ${this.seconds}`);
    };
}

const timerInstance = new SimpleTimer();

// 1. Direct invocation: Works as expected
timerInstance.tick(); // Tick: 1

// 2. Detaching the method (e.g. passing as callback):
const detachedTick = timerInstance.tick;
// detachedTick(); // Runtime Error in strict mode! `this` is undefined!

// 3. Arrow function solution:
const detachedArrowTick = timerInstance.tickArrow;
detachedArrowTick(); //  Works! Tick (Arrow): 2, because arrow functions capture `this` lexically.


// --- (B) 3 Ways to Fix "Lost `this`" in TypeScript ---

class ButtonHandler {
    label: string = "Submit Button";

    // Regular method:
    handleClick(): void {
        console.log(`Clicked on: ${this.label}`);
    }

    // Solution 1: Arrow function property (retains `this`)
    handleClickArrow = (): void => {
        console.log(`Clicked on (Arrow): ${this.label}`);
    };
}

const btn = new ButtonHandler();

// Solution 2: Explicit `.bind()` in constructor or call-site:
const boundClick = btn.handleClick.bind(btn);
boundClick(); //  Works!

// Solution 3: Inline wrapper arrow function:
setTimeout(() => btn.handleClick(), 100); //  Works!


// --- (C) TypeScript Special Feature: Explicit `this` Parameter ---
/*
  TypeScript allows you to declare a fake first parameter named `this` in functions.
  It does NOT exist in the compiled JavaScript!
  Its sole purpose is compile-time validation of what `this` must be when calling the function.
*/

type Account = {
    owner: string;
    balance: number;
};

// Declaring `this: Account` enforces that this function can ONLY be called
// within an execution context that matches `Account`!
function printAccountBalance(this: Account, currency: string): void {
    console.log(`${this.owner}'s Balance: ${currency}${this.balance}`);
}

const mySavings: Account = { owner: "Shuja", balance: 5000 };

// Using `.call()` or `.apply()` to supply the required `this`:
printAccountBalance.call(mySavings, "$"); //  Valid: "Shuja's Balance: $5000"

// printAccountBalance("$"); 
// Error: The 'this' context of type 'void' is not assignable to method's 'this' of type 'Account'.
// TypeScript caught a missing `this` bug before running the code!


// ==========================================================================
// SECTION 3: PRO LEVEL "this" PATTERNS
// ==========================================================================

// --- (A) Polymorphic `this` Type (Fluent Method Chaining in Inheritance) ---
/*
  When a method returns `this`, TypeScript uses "Polymorphic this".
  This means if a Subclass calls an inherited method that returns `this`,
  TypeScript knows the returned type is the SUBCLASS, not the Base class!
*/

class BasicCalculator {
    protected value: number = 0;

    constructor(initialValue: number = 0) {
        this.value = initialValue;
    }

    // Returning `this` type preserves the child type!
    add(n: number): this {
        this.value += n;
        return this;
    }

    multiply(n: number): this {
        this.value *= n;
        return this;
    }

    getResult(): number {
        return this.value;
    }
}

class ScientificCalculator extends BasicCalculator {
    sin(): this {
        this.value = Math.sin(this.value);
        return this;
    }

    square(): this {
        this.value = this.value * this.value;
        return this;
    }
}

// Notice how we can chain base methods (.add, .multiply) AND child methods (.square, .sin) seamlessly!
const sciResult = new ScientificCalculator(2)
    .add(3)        // Inherited from BasicCalculator, returns ScientificCalculator!
    .multiply(2)   // Inherited from BasicCalculator, returns ScientificCalculator!
    .square()      // Defined on ScientificCalculator
    .getResult();

console.log("Scientific Calculator Result:", sciResult); // ( (2 + 3) * 2 )^2 = 10^2 = 100


// --- (B) `this` Type Guards (`this is Type`) ---
/*
  You can use `this is Subtype` on instance methods to create clean,
  object-oriented type guards for narrowing class hierarchies.
*/

class FileSystemItem {
    constructor(public path: string) { }

    // Type guard checking if this item is a File
    isFile(): this is FileItem {
        return this instanceof FileItem;
    }

    // Type guard checking if this item is a Directory
    isDirectory(): this is DirectoryItem {
        return this instanceof DirectoryItem;
    }
}

class FileItem extends FileSystemItem {
    constructor(path: string, public sizeBytes: number) {
        super(path);
    }
}

class DirectoryItem extends FileSystemItem {
    constructor(path: string, public childrenCount: number) {
        super(path);
    }
}

function inspectFileSystemItem(item: FileSystemItem): void {
    if (item.isFile()) {
        // TypeScript narrows `item` to `FileItem` automatically!
        console.log(`File: ${item.path} (Size: ${item.sizeBytes} bytes)`);
    } else if (item.isDirectory()) {
        // TypeScript narrows `item` to `DirectoryItem` automatically!
        console.log(`Directory: ${item.path} (Contains: ${item.childrenCount} items)`);
    }
}

inspectFileSystemItem(new FileItem("/src/index.ts", 2048));
inspectFileSystemItem(new DirectoryItem("/src", 5));
