import Head from 'next/head'
import nookies from 'nookies'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next'
import { Swiper, SwiperSlide } from 'swiper/react'

import HomeLayout from '../components/home_page/HomeLayout/HomeLayout'
import MessageIndicator from '../components/common/MessageIndicator/MessageIndicator'
import HeroLeft from '../components/home_page/HeroLeft/HeroLeft'
import HeroRight from '../components/home_page/HeroRight/HeroRight'
import { useHomeContext } from '../components/home_page/context'
import { firebaseAdmin } from '../firebase/_firebaseAdmin'
import { useAuth } from '../firebase/auth'

import styles from '../public/css/index.module.css'
import 'swiper/css'

const swiperSettings = {
  spaceBetween: 0,
  slidesPerView: 1,
  className: styles.landingSlider,
  touchStartPreventDefault: false,
  breakpoints: {
    800: {
      slidesPerView: 2,
      spaceBetween: 0
    }
  }
}

/**
 * Application home page component.
 * Holds the hero section of the home page, which
 * includes the headers, short description, call-to-action
 * buttons and the portal forms.
 *
 * @return
 */
export default function HomePage() {
  const auth = useAuth()
  const router = useRouter()
  const {state} = useHomeContext()
  
  useEffect(() => {
    if (auth.user !== null && auth.user !== undefined) {
      router.push(`/${auth.user.emailVerified ? 'dashboard' : 'awaiting-verification'}`)
    }
  }, [auth.user, router])

  return (
    <>
      <Head>
        <title>{`${process.env.NEXT_PUBLIC_TITLE} | Home`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
      </Head>
      <Swiper {...swiperSettings}>
        <SwiperSlide className={styles.sliderItem}>
          <HeroLeft />
        </SwiperSlide>
        <SwiperSlide className={styles.sliderItem}>
          <HeroRight />
        </SwiperSlide>
      </Swiper>
      <MessageIndicator state={state.indicatorState} className={styles.indicatorPos} />
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const cookies = nookies.get(context)
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token)

    const {email_verified, email} = token

    return {
      redirect: {
        destination: email_verified ? '/dashboard' : '/awaiting-verification',
        permanent: false
      }
    }
  }
  catch (error) {
    // `token` cookie doesn't exist or user is not signed in
    return {
      props: {}
    }
  } 
}

HomePage.getLayout = function getLayout(page: JSX.Element) : JSX.Element {
  return (
    <HomeLayout>
      {page}
    </HomeLayout>
  )
}