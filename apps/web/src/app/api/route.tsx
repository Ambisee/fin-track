import { Document, renderToBuffer } from "@react-pdf/renderer"

export async function GET() {
	renderToBuffer(<Document></Document>)
}
