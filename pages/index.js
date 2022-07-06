import Head from 'next/head'
import { useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import nookies from 'nookies'

import MessageIndicator from '../components/common/MessageIndicator/MessageIndicator'
import HeroLeft from '../components/home_page/HeroLeft/HeroLeft'
import HeroRight from '../components/home_page/HeroRight/HeroRight'
import { reducer, defaultValues } from '../components/home_page/dispatcher'
import { firebaseAdmin } from '../firebase/firebaseAdmin'
import { useAuth } from '../firebase/auth'

import styles from './styles/index.module.css'

const data = {
  swiperSettings: {
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
}

export default function HomePage() {
  const auth = useAuth()
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, defaultValues)

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
      <Swiper {...data.swiperSettings}>
        <SwiperSlide className={styles.sliderItem}>
          <HeroLeft />
        </SwiperSlide>
        <SwiperSlide className={styles.sliderItem}>
          <HeroRight state={state} dispatch={dispatch} />
        </SwiperSlide>
      </Swiper>
      <AnimatePresence>
        {state.showMessage &&
          <MessageIndicator state={state} className={styles.indicatorPos} />
        }
      </AnimatePresence>
    </>
  )
}

export async function getServerSideProps(context) {
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