const IS_EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
const HAS_UPPER_CASE_REGEX = /.*[A-Z].*/
const HAS_LOWER_CASE_REGEX = /.*[a-z].*/
const HAS_DIGIT_REGEX = /.*[0-9].*/
const HAS_SPECIAL_CHAR_REGEX = /.*[!@#\$%^&*()_+{}\[\]:;<>,.?~].*/
const ONLY_ALPHANUMERIC = /^[a-zA-Z0-9]+$/


const upperCaseRegex = new RegExp(HAS_UPPER_CASE_REGEX)
const lowerCaseRegex = new RegExp(HAS_LOWER_CASE_REGEX)
const digitRegex = new RegExp(HAS_DIGIT_REGEX)
const specialCharRegex = new RegExp(HAS_SPECIAL_CHAR_REGEX)

function hasUpperCase(value: string): boolean {
    return upperCaseRegex.test(value)
}

function hasLowerCase(value: string): boolean {
    return lowerCaseRegex.test(value)
}

function hasDigit(value: string): boolean {
    return digitRegex.test(value)
}

function hasSpecialChar(value: string): boolean {
    return specialCharRegex.test(value)
}

function noWhiteSpace(value: string): boolean {
    return !value.includes(" ")
}

function isConditionFulfilled(value: string, condition: boolean): boolean {
    return (condition && (value !== ""))
}

export { 
    IS_EMAIL_REGEX,
    HAS_DIGIT_REGEX,
    HAS_LOWER_CASE_REGEX,
    HAS_UPPER_CASE_REGEX,
    ONLY_ALPHANUMERIC,
    hasDigit, 
    hasLowerCase, 
    hasUpperCase,
    hasSpecialChar,
    noWhiteSpace,
    isConditionFulfilled
}
