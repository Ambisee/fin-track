import Head from "next/head"

import DashboardLayout from "../../components/dashboard_page/DashboardLayout/DashboardLayout"

export default function DashboardRecordsPage() {
    return (
        <div>
            <Head>
                <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard | Records`}</title>
            </Head>
        </div>
    )
}

DashboardRecordsPage.getLayout = function getLayout(page) {
    return (
        <DashboardLayout pageIndex={2}>
            {page}
        </DashboardLayout>
    )
}