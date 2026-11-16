import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

export function useAdminIdentity() {
  const [identity, setIdentity] = useState({
    user: null,
    userRole: '',
    profileExists: false,
    disabled: false,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let unsubscribeProfile = null
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribeProfile?.()
        unsubscribeProfile = null

        if (!user) {
          setIdentity({
            user: null,
            userRole: '',
            profileExists: false,
            disabled: false,
            loading: false,
            error: null,
          })
          return
        }

        setIdentity({
          user,
          userRole: '',
          profileExists: false,
          disabled: false,
          loading: true,
          error: null,
        })
        unsubscribeProfile = onSnapshot(
          doc(db, 'users', user.uid),
          (snapshot) => {
            const profile = snapshot.exists() ? snapshot.data() : null
            setIdentity({
              user,
              userRole: profile?.userRole || profile?.role || 'User',
              profileExists: snapshot.exists(),
              disabled: Boolean(profile?.disabled),
              loading: false,
              error: null,
            })
          },
          (error) => {
            console.error('Admin profile subscription failed:', error)
            setIdentity({
              user,
              userRole: '',
              profileExists: false,
              disabled: false,
              loading: false,
              error,
            })
          }
        )
      },
      (error) => {
        console.error('Admin authentication subscription failed:', error)
        setIdentity({
          user: null,
          userRole: '',
          profileExists: false,
          disabled: false,
          loading: false,
          error,
        })
      }
    )

    return () => {
      unsubscribeProfile?.()
      unsubscribeAuth()
    }
  }, [])

  return identity
}
