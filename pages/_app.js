import StyledContainer from '../components/common/StyledContainer/StyledContainer'
import FirebaseAuthProvider from '../firebase/FirebaseAuthProvider'

import '../public/global.css'
import 'swiper/css'

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)
  
  return getLayout(
    <FirebaseAuthProvider>
      <StyledContainer>
          <Component {...pageProps} />
        </StyledContainer>
    </FirebaseAuthProvider>
  )
}

export default MyApp
