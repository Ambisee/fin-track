import Head from 'next/head'
import { useRouter } from 'next/router';
import Loading from '../../components/common/Loading/Loading';
import DashboardLayout from '../../components/dashboard_page/DashboardLayout/DashboardLayout';

import { useAuth } from '../../firebase/auth';
import { projectAuth } from '../../firebase/firebaseClient';

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
      <>
        <Head>
            <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard`}</title>
        </Head>
        Current User: {`${auth.user?.displayName}`}
        <button onClick={() => console.log(projectAuth.currentUser)}>CurrentUser</button>
        <button onClick={auth.userSignOut}>Sign Out</button>
      </>
    )
}

DashboardHomePage.getLayout = function getLayout(page) {
  if (projectAuth.currentUser == undefined) {
    return page
  }

  return (
    <DashboardLayout pageIndex={0}>
      {page}
    </DashboardLayout>
  )
}
