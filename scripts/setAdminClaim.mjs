// One-time setup script: gives the admin Firebase user the `admin: true`
// custom claim so Firestore rules can recognise admin writes.
//
// USAGE
//   1. Drop a `serviceAccount.json` (Firebase Admin service account) next
//      to this file (scripts/serviceAccount.json). DO NOT COMMIT IT.
//   2. From the project root:
//          node scripts/setAdminClaim.mjs admin@startupcredit.com
//      You can pass other emails as additional arguments if you want more
//      than one admin.
//   3. Have those admins sign out and sign back in so their ID token picks
//      up the new claim.
//
// NOTE: this script doesn't create the Firebase user. You still log in once
// via the admin login screen (which auto-creates the Firebase user) before
// running this script.

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccount.json'), 'utf8')
)
initializeApp({ credential: cert(serviceAccount) })

const emails = process.argv.slice(2)
if (emails.length === 0) {
  console.error('Usage: node scripts/setAdminClaim.mjs <email1> [email2] ...')
  process.exit(1)
}

const main = async () => {
  for (const email of emails) {
    try {
      const user = await getAuth().getUserByEmail(email)
      const existing = user.customClaims || {}
      await getAuth().setCustomUserClaims(user.uid, { ...existing, admin: true })
      console.log(`✔ ${email} → admin claim set (uid: ${user.uid})`)
    } catch (err) {
      console.error(`✗ ${email}:`, err?.message || err)
    }
  }
  console.log(
    '\nTell each admin to sign out and back in so their ID token refreshes with the new claim.'
  )
  process.exit(0)
}

main()
