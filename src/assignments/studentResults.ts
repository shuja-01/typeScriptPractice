// Task 1: Student Result Processor Use Promise + Literal Types + Type
// Inference Question:
// Create a function that evaluates a student's marks and returns a result after a delay.
// Requirements:
// 1. Define a literal type:
// * Use a Promise
// * Add a delay using setTimeout
// * Logic:
// * If marks>= 50 → return "pass"
// * If marks < 50 → reject and return "fail"

//Literal Type definition: only allows "pass" or "fail"
type ResultStatus = "pass" | "fail";

//Function returning a Promise explicitly
function evaluateStudentMarks(marks: number): Promise<ResultStatus> {
    // Creating and returning a new Promise
    return new Promise((resolve, reject) => {
        // Adding delay using setTimeout
        setTimeout(() => {
            if (marks >= 50) {
                resolve("pass");
            } else {
                reject("fail");
            }
        }, 1000);
    });
}

//CONSUMING THE PROMISE USING .then() AND .catch()
console.log("Evaluating students... (waiting for setTimeout delay)\n");

//Passing Marks (85 >= 50)
evaluateStudentMarks(85)
    .then((result) => {
        console.log(`[PASS CASE] Student scored 85 -> Result: "${result}"`);
    })
    .catch((error) => {
        console.log(`[FAIL CASE] Student scored 85 -> Error: "${error}"`);
    });

//Boundary Marks (50 >= 50)
evaluateStudentMarks(50)
    .then((result) => {
        console.log(`[PASS CASE] Student scored 50 -> Result: "${result}"`);
    })
    .catch((error) => {
        console.log(`[FAIL CASE] Student scored 50 -> Error: "${error}"`);
    });

//Failing Marks (40 < 50)
evaluateStudentMarks(40)
    .then((result) => {
        console.log(`[PASS CASE] Student scored 40 -> Result: "${result}"`);
    })
    .catch((error) => {
        console.log(`[FAIL CASE] Student scored 40 -> Result: "${error}" (Rejected)`);
    });

//Failing Marks (25 < 50)
evaluateStudentMarks(25)
    .then((result) => {
        console.log(`[PASS CASE] Student scored 25 -> Result: "${result}"`);
    })
    .catch((error) => {
        console.log(`[FAIL CASE] Student scored 25 -> Result: "${error}" (Rejected)`);
    });
