//forcefull type assertion: we can provide type on runtime using 'as'

// we need thois when we know better about the type than TS, it will help us to get suggestion in methods:
let response: any = "42";
let numericLength: number = response.length; // this will also work but "length" will not come as a suggestion, we have to write it ourselves.
let numericLength1: number = (response as string).length; // this will also work but "length" will come as a suggestion.
let numericLength2: number = response?.length || 0; // optional chaining, this will work only when response is not null or undefined

// we can also use angle brackets to provide type
let numericLength3: number = (<string>response).length; // this will also work but "length" will come as a suggestion

//============================
// type assertion in object: type assertion can also be used to provide type to an object
type Book = {
    name: string;
}

let bookString = '{"name":"The Family Man"}';
let bookObject = JSON.parse(bookString) as Book;

console.log(bookObject.name); //this will work only when we provide type

//----------------------------------------

//to access DOM methods, we can use this forceful type assertion.
//note that this will not work in .ts files, it will work only when compiling to .js files:
let inputElement = document.getElementById("userIn") as HTMLInputElement;
inputElement.value = "shuja";


// we have to check error is part of error instance or not then we can print:
//this also we check using forcefull assertion:

try {

} catch (error) {
    // we use any to check the error is part of error instance or not
    if (error instanceof Error) {
        console.log(error.message)
    } else {
        console.log("Error: ", error)
    }
}
//unknown Datatype::
//unknown is just like any but with little difference, we cannot access methods of unknown without checking the type
let newValue: unknown = "hello"
//newValue.length //error
newValue = 10 //no error
newValue = true //no error

if (typeof newValue === "string") {
    //now we can access methods of unknown
    console.log(newValue.length)
} else if (typeof newValue === "number") {
    //now we can access methods of unknown
    console.log(newValue.toFixed())
} else {
    console.log("Error: ", newValue)
}

//===
const data: unknown = "hello"
// const strData: string = data //will give error, first have to assert the type.
const strData: string = data as string // now will work

//==============================================   
//Never Datatype::
//Never datatype is used to represent the value that will never occur.

type Role = "admin" | "user";

function rediectingBasedOnRole(role: Role): void {
    if (role === "admin") {
        console.log("Redirecting to admin dashboard...");
        return;
    } else if (role === "user") {
        console.log("Redirecting to user dashboard...");
        return;
    }
    role; // if you hover on this, it will show its type as never, bcause we covered all the cases and this will never return or occure
}

type Role1 = "admin" | "user" | "guest";

function rediectingBasedOnRole1(role: Role1): void {
    if (role === "admin") {
        console.log("Redirecting to admin dashboard...");
        return;
    } else if (role === "user") {
        console.log("Redirecting to user dashboard...");
        return;
    }
    role; // because we did not include "guest" in the if condition, so its type will show as "Guest" 
}