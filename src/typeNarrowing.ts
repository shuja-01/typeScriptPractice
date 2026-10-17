// in this we set data type as unknown or using union, then we narrow down the datatype and return the values accordingly.

function getChai(kind: string | number) {
    //if param is string
    if (typeof kind === 'string') {
        return `Making ${kind} chai...`
    }
    return `Chai order: ${kind}`
}

console.log(getChai('Masala'))
console.log(getChai(2))

//passing optional param in function
function serveChai(msg?: string) { //using"?" we made it optional
    if (msg) {
        return `Serving ${msg} chai...`
    }
    return "Here is your chai"
}

console.log(serveChai())
console.log(serveChai("Lemon"))


//using exhausting checks:
function orderChai(size: 'small' | 'medium' | 'large' | number) {
    if (size === 'small') {
        return `Small cutting chai...`
    }
    if (size === 'medium' || size === 'large') {
        return `Serving regular chai of size ${size}`
    }
    if (typeof size === 'number') {
        return `Serving ${size} cutting chai...`
    }
}

console.log(orderChai('small'))
console.log(orderChai('large'))
console.log(orderChai(5))
//==========================================================
// in TS, we can created types by using type keyword:
type ChaiOrder = {
    typeOfChai: string
    sugar: number
}
//cheking the object is of type ChaiOrder or not
function isChaiOrder(obj: any): obj is ChaiOrder {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.typeOfChai === 'string' &&
        typeof obj.sugar === 'number'
    )
}

//cehcing the object using function
function serveOrder(item: ChaiOrder | string) {
    if (isChaiOrder(item)) {
        return `Serving ${item.typeOfChai} with ${item.sugar} spoons of sugar`
    }
    return `Serving regular chai: ${item}`
}
console.log(serveOrder({ typeOfChai: "Masala", sugar: 2 }))
console.log(serveOrder("Kadak"))
//==========================================================
// creating types of types by ourselves:

//creating types for unique properties of each type
type MasalaChai = { typeOfChai: "masala"; spicelevel: number; }
type GingerChai = { typeOfChai: "ginger"; gingerlevel: number; }
type KadakChai = { typeOfChai: "kadak"; strongnes: string; }

//creating union of all the types
type Chai = MasalaChai | GingerChai | KadakChai

//function to serve chai
function makeChai(chai: Chai) {
    switch (chai.typeOfChai) {
        case "masala":
            return `Making ${chai.typeOfChai} chai with ${chai.spicelevel} spoons of sugar`
            break;
        case "ginger":
            return `Making ${chai.typeOfChai} chai with ${chai.gingerlevel} spoons of ginger`
            break;
        case "kadak":
            return `Making ${chai.typeOfChai} chai with ${chai.strongnes} strength`
            break;
        default:
            // exhaustive check
            const _exhaustiveCheck: never = chai
            return _exhaustiveCheck
    }
}

console.log(makeChai({ typeOfChai: "masala", spicelevel: 2 }))
console.log(makeChai({ typeOfChai: "ginger", gingerlevel: 2 }))
console.log(makeChai({ typeOfChai: "kadak", strongnes: "strong" }))

//==================================
