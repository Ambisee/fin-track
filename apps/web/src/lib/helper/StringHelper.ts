class StringHelper {

    static removeWhitespaces(value: string) {
        return value.replaceAll(/\s/g, "")
    }

}

export { StringHelper }