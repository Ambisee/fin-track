import Head from 'next/head'

import DashboardLayout from '../../components/dashboard_page/DashboardLayout/DashboardLayout'

export default function DashboardAnalyticsPage() {
    return (
        <div>
            <Head>
                <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard | Analytics`}</title>
            </Head>
        </div>
    )
}