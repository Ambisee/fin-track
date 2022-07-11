import DashboardLayout from '../../components/dashboard_page/DashboardLayout/DashboardLayout'

export default function DashboardAccountPage() {
    return (
        <></>
    )
}

DashboardAccountPage.getLayout = function getLayout(page) {
    return (
        <DashboardLayout>
            {page}
        </DashboardLayout>
    )
}