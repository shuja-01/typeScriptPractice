//Union : passing more than 1 type

let id: number | string = 1;
id = "1";

function printId(id: number | string) {
    console.log(id);
}
printId(1);
printId("1");

//Any : passing any type

let data: any = 1;
data = "Shuja";
data = true;


//defining datatypes by ourselves

let apiRequestStatus: 'pending' | 'success' | 'error' = 'pending';

apiRequestStatus = 'success'
// apiRequestStatus = 'done' //error, not correct datatype



