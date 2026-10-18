/* ==========================================================================
   ACCESS SPECIFIERS (MODIFIERS) IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  ==========================================================================
  WHAT ARE ACCESS SPECIFIERS?
  ==========================================================================
  Access specifiers (also called access modifiers) are keywords used in classes
  to control the VISIBILITY and ACCESSIBILITY of properties, methods, and constructors.

  WHY DO WE USE THEM?
  1. Encapsulation: Protect internal data from accidental external mutation.
  2. Clear API Contracts: Clearly distinguish between the public API (what callers use)
     and internal implementation details (helpers, secrets, raw state).
  3. Security & Integrity: Guarantee valid state by funneling modifications through
     validated methods or setters.

  ==========================================================================
  VISIBILITY MATRIX:
  ==========================================================================
  Modifier             | Inside Class | Subclasses (Child) | Outside (Instances)
  --------------------------------------------------------------------------
  public (default)     |     Yes      |        Yes         |        Yes
  protected            |     Yes      |        Yes         |        No
  private (TS keyword) |     Yes      |        No          |        No
  #private (JS native) |     Yes      |        No          |        No (Hard runtime privacy)
  --------------------------------------------------------------------------
  readonly             | Can be combined with any modifier; prevents re-assignment.
*/


// ==========================================================================
// 1. THE BIG THREE: public, protected, AND private
// ==========================================================================

class BankAccount {
    // 1. public: Accessible everywhere (no restrictions)
    public accountHolder: string;

    // 2. protected: Accessible inside BankAccount AND any child classes (like SavingsAccount)
    protected accountType: string;

    // 3. private: Accessible ONLY inside BankAccount (hidden from child classes and outside)
    private balance: number;

    constructor(accountHolder: string, accountType: string, initialBalance: number) {
        this.accountHolder = accountHolder;
        this.accountType = accountType;
        this.balance = initialBalance;
    }

    // Public method: Callers can use this to interact with balance safely
    public deposit(amount: number): void {
        if (amount <= 0) {
            console.log("Deposit must be positive!");
            return;
        }
        this.balance += amount;
        console.log(`[Deposit] Added $${amount}. New balance: $${this.balance}`);
    }

    // Private helper method: Internal validation logic that outside code has no business seeing
    private isValidWithdrawal(amount: number): boolean {
        return amount > 0 && amount <= this.balance;
    }

    public withdraw(amount: number): boolean {
        if (this.isValidWithdrawal(amount)) {
            this.balance -= amount;
            console.log(`[Withdraw] Withdrew $${amount}. Remaining: $${this.balance}`);
            return true;
        }
        console.log(`[Withdraw Failed] Insufficient balance for $${amount}`);
        return false;
    }

    public getBalance(): number {
        return this.balance;
    }
}

// Child Class testing visibility:
class SavingsAccount extends BankAccount {
    private interestRate: number;

    constructor(holder: string, initialBalance: number, interestRate: number) {
        super(holder, "Savings", initialBalance);
        this.interestRate = interestRate;
    }

    public applyAnnualInterest(): void {
        // Can access `this.accountHolder` (public)
        // Can access `this.accountType` (protected from BankAccount)
        // CANNOT access `this.balance` (private to BankAccount):
        // this.balance += 100; // Error: Property 'balance' is private and only accessible within class 'BankAccount'.

        const currentBal = this.getBalance(); // Accessing through public parent method
        const interest = currentBal * (this.interestRate / 100);
        this.deposit(interest);
        console.log(`Interest of $${interest} applied to ${this.accountHolder}'s ${this.accountType} account.`);
    }
}

const myAcc = new SavingsAccount("Shuja", 1000, 5);
console.log(myAcc.accountHolder);  //  Allowed (public)
// console.log(myAcc.accountType); // Error: Property 'accountType' is protected
// console.log(myAcc.balance);     // Error: Property 'balance' is private
myAcc.deposit(500);                //  Allowed (public method)
myAcc.applyAnnualInterest();       //  Allowed (child class method using protected data)


// ==========================================================================
// 2. THE `readonly` SPECIFIER (COMBINING WITH ACCESS MODIFIERS)
// ==========================================================================
/*
  `readonly` ensures a property can ONLY be assigned:
  1. In its declaration, OR
  2. Inside the class's `constructor`.
  After that, it is immutable!
*/

class ServerConfig {
    // Can combine with access specifiers:
    public readonly serverId: string;
    protected readonly internalIP: string;
    private readonly secretKey: string;

    constructor(serverId: string, internalIP: string, secretKey: string) {
        this.serverId = serverId;
        this.internalIP = internalIP;
        this.secretKey = secretKey;
    }

    public changeConfig(): void {
        // this.serverId = "new-id"; // Error: Cannot assign to 'serverId' because it is read-only.
        console.log(`Server ${this.serverId} running with internal IP ${this.internalIP}`);
    }
}

const server = new ServerConfig("SRV-US-01", "10.0.0.1", "top-secret-999");
console.log("Server ID:", server.serverId); //  Allowed to read (public readonly)
// server.serverId = "SRV-EU-02";           //  Error: read-only property


// ==========================================================================
// 3. PARAMETER PROPERTIES (CLEAN BOILERPLATE-FREE MODIFIERS)
// ==========================================================================
/*
  Placing access specifiers directly in the constructor parameter list tells
  TypeScript to automatically declare and assign the property on `this`.
*/

class Employee {
    constructor(
        public readonly empId: number,     // public + readonly
        public name: string,               // public
        protected department: string,      // protected
        private salary: number             // private
    ) {
        // No manual assignments needed!
    }

    public getSummary(): string {
        return `ID: ${this.empId} | Name: ${this.name} | Dept: ${this.department} | Salary: $${this.salary}`;
    }
}

const emp1 = new Employee(101, "Hassan", "Engineering", 75000);
console.log(emp1.getSummary());


// ==========================================================================
// 4. ACCESS MODIFIERS ON GETTERS AND SETTERS
// ==========================================================================
/*
  A very common architecture pattern:
  - Make a property READABLE to everyone (public getter).
  - But RESTRICT writing/updating to internal class logic only (private setter)!
*/

class Order {
    private _orderStatus: "PENDING" | "SHIPPED" | "DELIVERED" = "PENDING";

    constructor(public readonly orderId: string) { }

    // Public getter: Anyone outside can read the status
    public get status(): string {
        return this._orderStatus;
    }

    // Private method to change status (can only be called internally through business actions)
    private setStatus(newStatus: "PENDING" | "SHIPPED" | "DELIVERED"): void {
        this._orderStatus = newStatus;
        console.log(`Order ${this.orderId} status changed to: ${this._orderStatus}`);
    }

    // Public action that transitions status safely
    public shipOrder(): void {
        if (this._orderStatus === "PENDING") {
            this.setStatus("SHIPPED");
        } else {
            console.log(`Cannot ship order in ${this._orderStatus} state!`);
        }
    }
}

const order = new Order("ORD-5541");
console.log("Initial Status:", order.status); //  Allowed to read: "PENDING"
// order.status = "DELIVERED"; // Error: Cannot assign to 'status' because it is a read-only property (no public setter)
order.shipOrder(); //  Allowed: calls internal private transition safely


// ==========================================================================
// 5. ACCESS MODIFIERS ON CONSTRUCTORS (PRO PATTERN)
// ==========================================================================
/*
  1. `private constructor`: Prevents `new` from anywhere outside the class.
     Ideal for Singleton Pattern and Static Factory methods.
  2. `protected constructor`: Prevents `new` on the base class directly,
     forcing consumers to instantiate a derived class.
*/

// Pattern A: Private Constructor (Singleton)
class AppLogger {
    private static instance: AppLogger | null = null;

    // Private constructor: Nobody can run `new AppLogger()`
    private constructor() {
        console.log("AppLogger initialized.");
    }

    public static getLogger(): AppLogger {
        if (!AppLogger.instance) {
            AppLogger.instance = new AppLogger();
        }
        return AppLogger.instance;
    }

    public log(msg: string): void {
        console.log(`[APP LOG]: ${msg}`);
    }
}

// const logger = new AppLogger(); // Error: Constructor of class 'AppLogger' is private
const logger = AppLogger.getLogger();
logger.log("System operational");


// Pattern B: Protected Constructor (Base-Only Class)
class AbstractDatabaseModel {
    // Protected constructor: cannot instantiate AbstractDatabaseModel directly
    protected constructor(public tableName: string) { }
}

class UserModel extends AbstractDatabaseModel {
    constructor() {
        super("users_table"); //  Child can invoke parent's protected constructor
    }
}

// const rawModel = new AbstractDatabaseModel("test"); // Error: Constructor is protected
const userModel = new UserModel();
console.log("Database Model Table:", userModel.tableName);


// ==========================================================================
// 6. PRO LEVEL: TYPESCRIPT `private` VS JAVASCRIPT `#private` (NATIVE PRIVACY)
// ==========================================================================
/*
  CRITICAL INTERVIEW & ARCHITECTURE CONCEPT:
  --------------------------------------------------------------------------
  Feature             | TypeScript `private`        | JavaScript `#private` (Hash field)
  --------------------------------------------------------------------------
  Where enforced?     | Compile-Time ONLY           | RUNTIME in JavaScript Engine!
  Compiled JS output  | Becomes a normal property!  | Remains `#private` in modern JS!
  Bypassable via `as any`? | YES: `(obj as any).field` | NO! Throws a runtime SyntaxError!
  --------------------------------------------------------------------------
*/

class SecureVault {
    // 1. TypeScript private (Soft compile-time privacy):
    private tsSecret: string = "TS-Secret-123";

    // 2. ECMAScript Native private field (Hard runtime privacy):
    #hardSecret: string = "JS-Hard-Secret-456";

    public reveal(): void {
        console.log(`Secrets inside class: TS=${this.tsSecret}, Native=${this.#hardSecret}`);
    }
}

const vault = new SecureVault();
vault.reveal();

// Demonstration of Soft vs Hard privacy:
// TypeScript `private` can be bypassed at runtime with type casting:
console.log("Bypassing TS private with (as any):", (vault as any).tsSecret); // Prints: TS-Secret-123!

// Native `#hardSecret` CANNOT be bypassed at runtime:
// console.log((vault as any)["#hardSecret"]); // Returns undefined!
// vault.#hardSecret; // Hard SyntaxError in JavaScript engine!


// ==========================================================================
// 7. PRO LEVEL: CROSS-INSTANCE ACCESS OF PRIVATE MEMBERS
// ==========================================================================
/*
  In TypeScript (and Java/C++), `private` is CLASS-PRIVATE, NOT INSTANCE-PRIVATE!
  This means: An instance of `Person` CAN access private fields of ANOTHER instance
  of `Person`, as long as the code is located inside the `Person` class!
*/

class PersonIdentity {
    private ssn: string;

    constructor(public name: string, ssn: string) {
        this.ssn = ssn;
    }

    // Method on instance `this` that inspects private data of `other` instance!
    public hasSameSSN(other: PersonIdentity): boolean {
        // Even though `other.ssn` is private, this code is inside `PersonIdentity`,
        // so TypeScript allows `this` to read `other.ssn`!
        return this.ssn === other.ssn;
    }
}

const personA = new PersonIdentity("John", "999-11-2222");
const personB = new PersonIdentity("Johnny", "999-11-2222");
const personC = new PersonIdentity("Alice", "111-22-3333");

console.log("Does John have same SSN as Johnny?", personA.hasSameSSN(personB)); // true
console.log("Does John have same SSN as Alice?", personA.hasSameSSN(personC));  // false


// ==========================================================================
// 8. PRO LEVEL: STRUCTURAL TYPING IMPACT OF private / protected
// ==========================================================================
/*
  Normally, TypeScript uses Structural Typing (Duck Typing):
  If two classes have the same public shape, they are interchangeable.

  HOWEVER: If a class has a `private` or `protected` member, TypeScript treats
  it NOMINALLY! Two classes with identical private members are NOT interchangeable.
*/

class WalletA {
    private balance: number = 100;
}

class WalletB {
    private balance: number = 100;
}

let wA: WalletA = new WalletA();
// let wB: WalletA = new WalletB();
// Error: Type 'WalletB' is not assignable to type 'WalletA'.
// Types have separate declarations of a private property 'balance'.
// TypeScript guarantees that private members cannot be spoofed!
