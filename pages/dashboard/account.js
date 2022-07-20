import Head from 'next/head'

import DashboardLayout from '../../components/dashboard_page/DashboardLayout/DashboardLayout'

export default function DashboardAccountPage() {
    return (
        <div>
            <Head>
                <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard | Account`}</title>
            </Head>
        </div>
    )
}

DashboardAccountPage.getLayout = function getLayout(page) {
    return (
        <DashboardLayout pageIndex={1}>
            {page}
        </DashboardLayout>
    )
}
