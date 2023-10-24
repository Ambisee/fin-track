// const IS_EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
const IS_EMAIL_REGEX = /^(?=.{1,256}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
/* const HAS_UPPER_CASE_REGEX = /.*[A-Z].*/
const HAS_UPPER_CASE_REGEX = /^(?=.*[A-Z]).+$/
// const HAS_LOWER_CASE_REGEX = /.*[a-z].*/
const HAS_LOWER_CASE_REGEX = /^(?=.*[a-z]).+$/
// const HAS_DIGIT_REGEX = /.*[0-9].*/
const HAS_DIGIT_REGEX = /^(?=.*[0-9]).+$/


const upperCaseRegex = new RegExp(HAS_UPPER_CASE_REGEX)
const lowerCaseRegex = new RegExp(HAS_LOWER_CASE_REGEX)
const digitRegex = new RegExp(HAS_DIGIT_REGEX)

function hasUpperCase(value: string): boolean {
    return upperCaseRegex.test(value)
}

function hasLowerCase(value: string): boolean {
    return lowerCaseRegex.test(value)
}

function hasDigit(value: string): boolean {
    return digitRegex.test(value)
}

function isConditionFulfilled(value: string, condition: boolean): boolean {
    return (condition && (value !== ""))
}

export { 
    IS_EMAIL_REGEX,
    HAS_DIGIT_REGEX,
    HAS_LOWER_CASE_REGEX,
    HAS_UPPER_CASE_REGEX,
    hasDigit, 
    hasLowerCase, 
    hasUpperCase,
    isConditionFulfilled
}
