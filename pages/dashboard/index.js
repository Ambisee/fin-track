import Head from 'next/head'
import { useRouter } from 'next/router';
import Loading from '../../components/common/Loading/Loading';
import DashboardFormField from '../../components/dashboard_page/DashboardFormField/DashboardFormField';
import DashboardLayout from '../../components/dashboard_page/DashboardLayout/DashboardLayout';

import { useAuth } from '../../firebase/auth';

import styles from './styles/index.module.css'

export default function DashboardHomePage() {
    const auth = useAuth()
    const router = useRouter()

    if (auth.user === undefined) {
      return <Loading />
    }

    if (auth.user === null && auth.user !== undefined) {
        router.push('/')
        return <></>
    }

    if (!(auth.user.emailVerified)) {
      router.push('/awaiting-verification')
      return <></>
    }

    return (
      <div className={styles.dashboardHome}>
        <Head>
            <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard`}</title>
        </Head>
        <h3>Welcome back, <span>{`${auth?.user.displayName || 'user111'}`}</span></h3>
        
        {/* New Entry Form */}
        <div className={styles.newEntryForm}>
          <span className={styles.mainHeader}>Add a new entry :</span>
          <form>
            <div className={styles.entryFormContainer}>
              <DashboardFormField
                name="Date"
                type="date"
                required
              />
              <DashboardFormField 
                name="Detail"
                type="text"
                required
              />
              <DashboardFormField 
                name="Amount"
                type="text"
                required
              />
            </div>
          </form>
        </div>
      </div>
    )
}

DashboardHomePage.getLayout = function getLayout(page) {
  return (
    <DashboardLayout pageIndex={0}>
      {page}
    </DashboardLayout>
  )
}
