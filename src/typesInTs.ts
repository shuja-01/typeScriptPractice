// annotation and inferece :
//annotation: when we explicitly declare the type of a variable

let name: string = "Shuja";
let age: number = 20;
let isStudent: boolean = true;
let hobbies: string[] = ["coding", "reading", "gaming"];

// inference: when the type is inferred from the value
let anotherName = "Hassan";
let anotherAge = 25;
let isTeacher = false;
let anotherHobbies = ["coding", "reading", "gaming"];

//inference: when type is not explicitly declared and ts infers it from the value

let score = 100
//score = true //error

let userName = "Shuja";
// username = 3 //error
