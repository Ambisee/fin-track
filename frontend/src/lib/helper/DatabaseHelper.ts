class DatabaseHelper {
    static parseSearchQuery(query: string) {
        return query.replace(" ", "+")
    }
}

export { DatabaseHelper }