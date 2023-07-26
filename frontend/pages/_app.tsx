import StyledContainer from '../components/common/StyledContainer/StyledContainer'
import FirebaseAuthProvider from '../firebase/FirebaseAuthProvider'
import FirestoreProvider from '../firebase/FirestoreProvider'

import '../public/css/global.css'

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)
  
  return (
    <FirebaseAuthProvider>
      <FirestoreProvider>
        <StyledContainer>
          {getLayout(<Component {...pageProps} />)}
        </StyledContainer>
      </FirestoreProvider>
    </FirebaseAuthProvider>
  )
}

export default MyApp
