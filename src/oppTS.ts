/* ==========================================================================
   OBJECT-ORIENTED PROGRAMMING (OOP) IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  WHAT IS OOP?
  Object-Oriented Programming (OOP) is a programming paradigm based on the concept of "Objects". An object contains:
  1. State (Properties / Data)
  2. Behavior (Methods / Functions)

  WHY USE OOP IN TYPESCRIPT?
  1. Modularity & Organization: Group related data and operations together.
  2. Type Safety: TypeScript enforces contracts, property types, and access rules at compile-time.
  3. Reusability: Write code once and extend it through inheritance and composition.
  4. Encapsulation: Protect internal data from outside tampering using access modifiers.

  THE 4 PILLARS OF OOP:
  1. Encapsulation  -> Hiding internal details and protecting state (private/protected).
  2. Inheritance    -> Reusing code across classes using parent-child relationships (extends).
  3. Polymorphism   -> Performing a single action in different ways (method overriding).
  4. Abstraction    -> Hiding implementation complexity and showing only essentials (abstract / interfaces).
*/


// ==========================================================================
// 1. BASIC CLASS & INSTANTIATION (FOUNDATION)
// ==========================================================================
/*
  A Class is a blueprint (cookie cutter).
  An Object (Instance) is the real entity created from that blueprint (the cookie).
*/

class ChaiCup {
    // 1. Property declarations with types
    flavour: string;
    temperature: number; // in Celsius
    hasSugar: boolean;

    // 2. Constructor: Automatically executed when a new object is created with `new`
    constructor(flavour: string, temperature: number, hasSugar: boolean) {
        this.flavour = flavour;
        this.temperature = temperature;
        this.hasSugar = hasSugar;
    }

    // 3. Methods: Functions belonging to the class
    serve(): string {
        return `Serving a hot cup of ${this.flavour} chai at ${this.temperature}°C (Sugar: ${this.hasSugar ? "Yes" : "No"}).`;
    }
}

// Creating instances (objects)
const cup1 = new ChaiCup("Masala", 85, true);
console.log(cup1.serve());


// ==========================================================================
// 2. ACCESS MODIFIERS (ENCAPSULATION)
// ==========================================================================
/*
  TypeScript provides 3 access modifiers to control visibility:
  -------------------------------------------------------------------------
  Modifier   | Inside Class | Subclasses (Child) | Outside the Class
  -------------------------------------------------------------------------
  public     |     Yes      |        Yes         |        Yes (Default)
  protected  |     Yes      |        Yes         |        No
  private    |     Yes      |        No          |        No
  -------------------------------------------------------------------------
  readonly   | Cannot be modified after initial assignment in constructor
*/

class BankAccount {
    public readonly accountNumber: string; // Accessible everywhere, but cannot be changed
    public accountHolder: string;          // Accessible everywhere and can be changed
    protected accountType: string;         // Accessible inside BankAccount and derived classes
    private balance: number;               // Accessible ONLY inside BankAccount

    constructor(accountNumber: string, holder: string, type: string, initialBalance: number) {
        this.accountNumber = accountNumber;
        this.accountHolder = holder;
        this.accountType = type;
        this.balance = initialBalance;
    }

    // Public method to safely deposit money
    public deposit(amount: number): void {
        if (amount <= 0) {
            console.log("Invalid deposit amount!");
            return;
        }
        this.balance += amount;
        console.log(`Deposited $${amount}. New balance: $${this.balance}`);
    }

    // Public method to safely check balance
    public getBalance(): number {
        return this.balance;
    }
}

const myAccount = new BankAccount("ACC-98765", "Shuja", "Savings", 1000);
console.log(myAccount.accountHolder); // Allowed (public)
// myAccount.accountNumber = "123";  // Error: Cannot assign to 'accountNumber' because it is read-only
// myAccount.balance;                // Error: Property 'balance' is private
myAccount.deposit(500);              // Allowed through public method


// ==========================================================================
// 3. PARAMETER PROPERTIES (PRO SHORTHAND SYNTAX)
// ==========================================================================
/*
  Instead of:
      1. Declaring fields at the top
      2. Passing them into constructor
      3. Doing `this.field = field`

  TypeScript lets you declare and initialize properties directly in the constructor arguments!
*/

class Product {
    // Adding an access modifier (public/private/protected/readonly) in front of
    // constructor parameters automatically creates and assigns them!
    constructor(
        public id: number,
        public name: string,
        private price: number,
        readonly sku: string
    ) {
        // No need to write `this.id = id;` - TypeScript does it automatically!
    }

    public getPriceDetails(): string {
        return `Product: ${this.name} | Price: $${this.price} | SKU: ${this.sku}`;
    }
}

const laptop = new Product(101, "MacBook Pro", 2000, "SKU-APPLE-01");
console.log(laptop.getPriceDetails());


// ==========================================================================
// 4. GETTERS AND SETTERS (`get` & `set`)
// ==========================================================================
/*
  Getters and Setters allow controlled access to private fields.
  - `get`: intercepts reading a property (can compute/format values).
  - `set`: intercepts assigning a value (can validate before saving).
*/

class Employee {
    private _salary: number = 0;

    constructor(public name: string, salary: number) {
        this.salary = salary; // calls setter
    }

    // Getter for salary
    get salary(): number {
        return this._salary;
    }

    // Setter for salary with validation logic
    set salary(newSalary: number) {
        if (newSalary <= 0) {
            throw new Error("Salary must be a positive number!");
        }
        this._salary = newSalary;
    }
}

const emp = new Employee("Hassan", 50000);
console.log(`Current Salary: $${emp.salary}`); // Calls getter (no parentheses needed!)
emp.salary = 60000;                            // Calls setter
console.log(`Updated Salary: $${emp.salary}`);


// ==========================================================================
// 5. INHERITANCE (`extends` and `super`)
// ==========================================================================
/*
  Inheritance allows a Child class to inherit properties and methods from a Parent class.
  - `extends`: links the child to the parent.
  - `super()`: calls the parent constructor (MUST be called before using `this`).
*/

class Person {
    constructor(public name: string, public age: number) { }

    introduce(): string {
        return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
    }
}

// Developer inherits from Person
class Developer extends Person {
    constructor(name: string, age: number, public primaryLanguage: string) {
        super(name, age); // Call the parent (Person) constructor
    }

    // Method specific to Developer
    code(): string {
        return `${this.name} is writing code in ${this.primaryLanguage}.`;
    }

    // Overriding parent method:
    introduce(): string {
        // Can call parent's implementation with `super.introduce()`
        return `${super.introduce()} I work as a Developer!`;
    }
}

const dev = new Developer("Shuja", 22, "TypeScript");
console.log(dev.introduce());
console.log(dev.code());


// ==========================================================================
// 6. POLYMORPHISM (ONE INTERFACE, MULTIPLE BEHAVIORS)
// ==========================================================================
/*
  Polymorphism ("many shapes") means different child classes can implement the
  same method name in their own unique way.
*/

class PaymentProcessor {
    processPayment(amount: number): void {
        console.log(`Processing standard payment of $${amount}`);
    }
}

class CreditCardProcessor extends PaymentProcessor {
    override processPayment(amount: number): void {
        console.log(`Charging $${amount} to Credit Card (with 2% transaction fee).`);
    }
}

class UpiProcessor extends PaymentProcessor {
    override processPayment(amount: number): void {
        console.log(`Transferring $${amount} instantly via UPI (Zero fee).`);
    }
}

// A single function can accept any PaymentProcessor and run its specific behavior!
function checkout(processor: PaymentProcessor, amount: number) {
    processor.processPayment(amount); // Polymorphic method call
}

checkout(new CreditCardProcessor(), 100);
checkout(new UpiProcessor(), 100);


// ==========================================================================
// 7. ABSTRACTION & ABSTRACT CLASSES (`abstract`)
// ==========================================================================
/*
  WHAT IS AN ABSTRACT CLASS?
  - A base class that CANNOT be instantiated directly (cannot do `new Vehicle()`).
  - Used strictly as a blueprint for other classes to inherit from.
  - Can contain:
      1. Concrete methods (regular implemented methods).
      2. Abstract methods (methods WITHOUT a body that subclasses MUST implement).
*/

abstract class Vehicle {
    constructor(public brand: string, public model: string) { }

    // Concrete method: shared by all vehicles
    startEngine(): void {
        console.log(`${this.brand} ${this.model} engine started: Vroom!`);
    }

    // Abstract method: Child classes MUST provide their own implementation
    abstract calculateMileage(): number;
}

class Car extends Vehicle {
    constructor(brand: string, model: string, private fuelUsed: number, private distanceKm: number) {
        super(brand, model);
    }

    // Must implement calculateMileage() or TypeScript will throw a compile error!
    calculateMileage(): number {
        return this.distanceKm / this.fuelUsed;
    }
}

// const v = new Vehicle("Toyota", "Corolla"); // Error: Cannot create an instance of an abstract class
const myCar = new Car("Honda", "Civic", 40, 600);
myCar.startEngine();
console.log(`Car Mileage: ${myCar.calculateMileage()} km/L`);


// ==========================================================================
// 8. STATIC MEMBERS (`static`)
// ==========================================================================
/*
  Static properties and methods belong to the CLASS ITSELF, not to any object instance.
  You access them directly using `ClassName.property` without creating an object with `new`.
*/

class MathUtils {
    public static readonly PI: number = 3.14159;

    public static calculateCircleArea(radius: number): number {
        return this.PI * radius * radius;
    }
}

console.log("PI:", MathUtils.PI);
console.log("Circle Area (radius 5):", MathUtils.calculateCircleArea(5));

// Real-world example: Tracking total users created
class UserTracker {
    public static totalUsers: number = 0;

    constructor(public username: string) {
        UserTracker.totalUsers++; // Increments the static counter on the class
    }
}

new UserTracker("Alice");
new UserTracker("Bob");
new UserTracker("Charlie");
console.log(`Total users created: ${UserTracker.totalUsers}`); // Output: 3


// ==========================================================================
// 9. PRO LEVEL: GENERIC CLASSES
// ==========================================================================
/*
  Generic Classes allow you to define a class with type variables (<T>).
  This gives you maximum reusability with 100% compile-time type safety.
*/

class DataStore<T> {
    private items: T[] = [];

    addItem(item: T): void {
        this.items.push(item);
    }

    getItems(): T[] {
        return this.items;
    }

    getItemAtIndex(index: number): T | undefined {
        return this.items[index];
    }
}

// Store of Numbers
const numberStore = new DataStore<number>();
numberStore.addItem(10);
numberStore.addItem(20);
// numberStore.addItem("text"); // Error: Type 'string' is not assignable to 'number'

// Store of Objects
type CartItem = { title: string; price: number };
const cartStore = new DataStore<CartItem>();
cartStore.addItem({ title: "Keyboard", price: 75 });
console.log("Cart items:", cartStore.getItems());


// ==========================================================================
// 10. INTERFACE IMPLEMENTATION (`implements`)
// ==========================================================================
/*
  A class can implement one or more interfaces to enforce a strict contract.
  Unlike inheritance (`extends`), a class can implement MULTIPLE interfaces.
*/

interface Authenticatable {
    login(password: string): boolean;
    logout(): void;
}

interface Loggable {
    logActivity(action: string): void;
}

class AdminUser implements Authenticatable, Loggable {
    constructor(public username: string, private secretHash: string) { }

    login(password: string): boolean {
        return password === this.secretHash;
    }

    logout(): void {
        console.log(`${this.username} logged out.`);
    }

    logActivity(action: string): void {
        console.log(`[AUDIT LOG] Admin ${this.username} performed: ${action}`);
    }
}

const admin = new AdminUser("SuperAdmin", "root123");
console.log("Login success:", admin.login("root123"));
admin.logActivity("Updated system configs");
