import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    turbopack: {
        root: path.join(process.cwd())
    },
    async redirects() {
        return [
            {
                source: "/signin",
                destination: "/sign-in",
                permanent: true
            },
            {
                source: "/signup",
                destination: "/sign-up",
                permanent: true
            },
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
