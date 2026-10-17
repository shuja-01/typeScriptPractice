// ==========================================
// Interface in TypeScript
// ==========================================
// An interface is a contract or blueprint that defines the structure (shape) of an object.
// Why we use it:
// 1. Enforces object shapes (type safety & autocompletion).
// 2. Reusability across your application.
// 3. Extensibility: Easy to extend and inherit using "extends".

// 1. Basic Interface
interface User {
    id: number;
    name: string;
    email: string;
}

const user1: User = {
    id: 1,
    name: "Shuja",
    email: "shuja@example.com",
};

// 2. Optional (?) and Readonly properties
interface Product {
    readonly id: number; // cannot be modified after assignment
    name: string;
    price: number;
    discount?: number;   // optional property (not mandatory)
}

const laptop: Product = {
    id: 101,
    name: "MacBook",
    price: 1200,
};

// laptop.id = 102; // Error: Cannot assign to 'id' because it is read-only

// 3. Methods inside an Interface
interface ChaiMaker {
    brand: string;
    brew(chaiType: string): string;
}

const chaiMachine: ChaiMaker = {
    brand: "ChaiPoint",
    brew: (chaiType) => `Fresh ${chaiType} chai is ready!`,
};

console.log(chaiMachine.brew("Masala"));

// 4. Extending an Interface (Inheritance)
interface Person {
    name: string;
    age: number;
}

// Inherits 'name' and 'age' from Person and adds extra fields
interface Employee extends Person {
    employeeId: number;
    role: string;
}

const emp: Employee = {
    name: "Hassan",
    age: 26,
    employeeId: 501,
    role: "Developer",
};


//Readonly:
type Config = {
    readonly appname: string
    version: number
}

const config: Config = {
    appname: "Chai",
    version: 1
}
// config.appname = "newApp" //will throw error bcuse appname is readonly

//intersecion and union:

//union |:
type TeaType = "masala" | "ginger" | "karak"
function orderChai(t: TeaType) {
    console.log(`Orderinng ${t} chai`);
}
orderChai("masala")
// orderChai("masalaa") //error

//intersection: &:
type BaseChai = { teaLeaves: number }
type Extra = { masala: Number }

type MasalaChai = BaseChai & Extra

//Optional Values:

type User1 = {
    username: string
    userId?: string
}
//passing the optional value
const U1: User1 = {
    username: "Shuja",
    userId: "123"
}

//not passing the optional value
const U2: User1 = {
    username: "Shuja"
}

//tuple:
//tuple is a array with fixed size and fixed types:
type userTuple = [string, number, boolean]
const userTuple: userTuple = ["Shuja", 20, true]
console.log(userTuple)

//tuple with readonly:
type userTuple1 = readonly [string, number, boolean]
const userTuple1: userTuple1 = ["Shuja", 20, true]
console.log(userTuple1)