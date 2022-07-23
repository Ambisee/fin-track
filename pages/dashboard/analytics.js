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

DashboardAnalyticsPage.getLayout = function getLayout(page) {
    return (
        <DashboardLayout pageIndex={3}>
            {page}
        </DashboardLayout>
    )
}