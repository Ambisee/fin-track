import { UserID } from "./User"

export interface Category {
	/** This is the UUID string value of the owner who created this Category. */
	id: UserID
	name: string
}
