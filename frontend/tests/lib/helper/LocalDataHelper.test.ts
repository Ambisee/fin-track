import fs from "fs"
import { LocalDataHelper } from "@/lib/helper/LocalDataHelper"
import { Entry } from "@/types/supabase"
import { resolve } from "path"

interface TestCase<T, I, E> {
	title: T
	operation: T
	input: I
	expected: E
}

const intermediatePaths = "../../resources"
const INSERT_TC_FILENAME = "LocalDataHelper-INSERT-testcases.json"
const DELETE_TC_FILENAME = "LocalDataHelper-DELETE-testcases.json"

function getResource(filename: string) {
	return resolve(__dirname, intermediatePaths, filename)
}

const insertTCFilepath = getResource(INSERT_TC_FILENAME)
const deleteTCFilepath = getResource(DELETE_TC_FILENAME)

const insertTCFileContent = fs.readFileSync(insertTCFilepath)
const deleteTCFileContent = fs.readFileSync(deleteTCFilepath)

const insertTCContent = JSON.parse(insertTCFileContent.toString("utf-8"))
const deleteTCContent = JSON.parse(deleteTCFileContent.toString("utf-8"))

describe("LocalDataHelper tests", () => {
	let localStore: Entry[]

	describe("INSERT tests", () => {
		let initialFixedStore: Entry[] = insertTCContent.initialStore
		let testcases: TestCase<string, Entry, Entry[]>[] =
			insertTCContent.testcases

		beforeEach(() => {
			localStore = [...initialFixedStore]
		})

		it.each(testcases)("$title", ({ title, input, expected }) => {
			const result: Entry[] = LocalDataHelper.insertEntry(
				initialFixedStore,
				input
			)
			expect(result).toEqual(expected)
		})
	})

	describe("DELETE tests", () => {
		let initialFixedStore: Entry[] = deleteTCContent.initialStore
		let testcases: TestCase<string, Entry, Entry[]>[] =
			deleteTCContent.testcases

		beforeEach(() => {
			localStore = [...initialFixedStore]
		})

		it.each(testcases)("$title", ({ title, input, expected }) => {
			const result: Entry[] = LocalDataHelper.deleteEntry(localStore, input)
			expect(result).toEqual(expected)
		})
	})

	describe("UPDATE tests", () => {})
})
