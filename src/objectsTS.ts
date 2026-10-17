// ==========================================
// Objects in TypeScript
// ==========================================
// An object in TypeScript is a collection of key-value pairs.
// Why we type objects:
// 1. Prevents spelling mistakes in keys (e.g. 'usename' instead of 'username').
// 2. Guarantees required properties exist and have the correct data types.
// 3. Autocompletion & Intellisense support in your editor.

// 1. Inferred Object Type
// TS automatically infers: { name: string; cups: number; isAvailable: boolean }
const chai = {
    name: "Masala Chai",
    cups: 2,
    isAvailable: true,
};

// chai.cups = "two"; // Error: Type 'string' is not assignable to type 'number'


// 2. Explicit Type Annotation on an Object
let teaOrder: {
    teaName: string;
    price: number;
    sugar?: boolean; // Optional property
} = {
    teaName: "Ginger Chai",
    price: 25,
};


// 3. Reusable Object Type using 'type' alias (Recommended for clean code)
type ChaiRecipe = {
    title: string;
    ingredients: string[];
    readonly isOrganic: boolean; // Cannot be changed after creation
};

const myRecipe: ChaiRecipe = {
    title: "Elaichi Chai",
    ingredients: ["Water", "Milk", "Tea leaves", "Cardamom"],
    isOrganic: true,
};

// myRecipe.isOrganic = false; // Error: Cannot assign to 'isOrganic' because it is read-only


// 4. Passing Objects to Functions
function printRecipe(recipe: ChaiRecipe): void {
    console.log(`Recipe: ${recipe.title}, Ingredients: ${recipe.ingredients.join(", ")}`);
}

printRecipe(myRecipe);


// 5. Functions Returning an Object
function makeOrder(name: string, price: number): { id: number; name: string; price: number } {
    return {
        id: Date.now(),
        name,
        price,
    };
}

const order1 = makeOrder("Lemon Tea", 20);
console.log(order1);


// 6. Dynamic Object Keys (Index Signature)
// Used when you don't know all key names in advance
type ChaiRating = {
    [chaiName: string]: number; // Any string key will hold a number value
};

const ratings: ChaiRating = {
    masala: 4.8,
    ginger: 4.5,
    greenTea: 3.9,
};


// ==========================================
// TypeScript Utility Types
// ==========================================
// Think of Utility Types as "built-in helpers/tools" in TypeScript.
// Instead of creating brand new types manually, they take an existing type
// and quickly modify it for you (e.g. make all fields optional, remove fields, etc.)


// ------------------------------------------
// 1. Partial<Type>
// ------------------------------------------
// WHAT IT DOES: Makes ALL properties in a type OPTIONAL (adds '?' to every key).
// WHY USE IT: Perfect for update/patch functions where you only want to change
// 1 or 2 fields without having to pass the entire object.

type Chai = {
    name: string;
    price: number;
    isHot: boolean
}

// Partial<Chai> behind the scenes looks like:
// { name?: string; price?: number; isHot?: boolean; }
const updatedChai = (updates: Partial<Chai>) => {
    return { ...chai, ...updates }
}

updatedChai({ price: 25 })          // OK: only updating price
updatedChai({ isHot: false })       // OK: only updating isHot
updatedChai({})                     // OK: passing nothing is also allowed!


// ------------------------------------------
// 2. Required<Type>
// ------------------------------------------
// WHAT IT DOES: The exact opposite of Partial. It makes ALL properties MANDATORY
// (removes any '?' optional marks).
// WHY USE IT: When a type originally has optional fields, but in this specific function,
// you strictly want to ensure every single field is provided.

type ChaiOrder = {
    name?: string;       // originally optional
    quantity?: number    // originally optional
}

// Required<ChaiOrder> behind the scenes looks like:
// { name: string; quantity: number; } -> Both are now strictly required!
const placeOrder = (order: Required<ChaiOrder>) => {
    console.log(`Order placed for ${order.quantity} ${order.name}`)
}

placeOrder({ name: "Masala Chai", quantity: 2 }) // OK: provided both fields
// placeOrder({name: "Masala Chai"}) // ERROR: 'quantity' is missing because Required<> requires ALL fields!


// ------------------------------------------
// 3. Pick<Type, Keys>
// ------------------------------------------
// WHAT IT DOES: Selects ONLY the specific properties you mention and ignores the rest.
// WHY USE IT: When you have a large type (e.g. 10 properties) and you want a lighter
// version with only 2 or 3 fields (like a card preview or summary view).

type Chai1 = {
    name: string;
    price: number;
    isHot: boolean;
    ingredients: string[];
}

// We only pick "name" and "price" from Chai1:
type BasicChaiInfo = Pick<Chai1, "name" | "price"> // it picks the name and price from Chai1

const chaiInfo: BasicChaiInfo = {
    name: "Masala Chai",
    price: 25
    // isHot and ingredients are NOT needed here!
}


// ------------------------------------------
// 4. Omit<Type, Keys>
// ------------------------------------------
// WHAT IT DOES: The opposite of Pick. It REMOVES the properties you specify and keeps everything else.
// WHY USE IT: When you want everything from an existing type except sensitive or unwanted data
// (e.g., hiding a password or secret ingredients before sending data).

type Chai2 = {
    name: string;
    price: number;
    isHot: boolean;
    secretIngredients: string;
}

// We drop "secretIngredients" and keep "name", "price", and "isHot":
type ChaiDetails = Omit<Chai2, "secretIngredients"> // it omits the secretIngredients from Chai2


// ------------------------------------------
// 5. Readonly<Type>
// ------------------------------------------
// WHAT IT DOES: Makes all properties in an object read-only.
// Once created, you CANNOT reassign or mutate any of its keys.
// Example:
// type FrozenChai = Readonly<Chai>;


// ------------------------------------------
// 6. Record<Keys, Type>
// ------------------------------------------
// WHAT IT DOES: Creates an object (dictionary / map) where:
// - The 1st parameter defines what the KEYS must be (e.g. number or string).
// - The 2nd parameter defines what the VALUES must be (e.g. User object).
// WHY USE IT: Cleanest way to type lookups, caches, or dictionaries by ID.

type User = {
    id: number;
    name: string;
}

// Record<number, User> means:
// An object whose keys are numbers, and each value is a User: { [key: number]: User }
type UserManager = {
    users: Record<number, User>
}

const userManager: UserManager = {
    users: {
        1: { id: 1, name: "Shuja" },
        2: { id: 2, name: "Hassan" }
    }
}



