import Head from 'next/head'
import { useRouter } from 'next/router';
import Loading from '../../components/common/Loading/Loading';
import DashboardLayout from '../../components/dashboard_page/DashboardLayout/DashboardLayout';

import { useAuth } from '../../firebase/auth';
import { projectAuth } from '../../firebase/firebaseClient';

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
