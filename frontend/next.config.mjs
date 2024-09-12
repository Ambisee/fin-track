/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	async redirects() {
		return [
			{
				source: "/signin/:path",
				destination: "/sign-in/:path",
				permanent: true
			},
			{
				source: "/signup/:path",
				destination: "/sign-up/:path",
				permanent: true
			},
			{
				source: "/forgotpassword/:path",
				destination: "/forgot-password/:path",
				permanent: true
			}
		]
	}
}

export default nextConfig
