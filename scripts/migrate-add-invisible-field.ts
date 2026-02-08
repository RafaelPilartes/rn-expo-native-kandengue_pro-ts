// Migration Script: Add is_invisible field to existing drivers
// Run this ONCE to update all existing driver documents

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore'

// TODO: Replace with your Firebase config
const firebaseConfig = {
  // Your config here
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrateDrivers() {
  console.log('🔄 Starting migration: Adding is_invisible field to drivers...')

  const driversRef = collection(db, 'drivers')
  const snapshot = await getDocs(driversRef)

  let updated = 0
  let skipped = 0

  for (const driverDoc of snapshot.docs) {
    const data = driverDoc.data()

    // Check if field already exists
    if (data.is_invisible !== undefined) {
      console.log(`⏭️  Skipping ${driverDoc.id} - already has is_invisible`)
      skipped++
      continue
    }

    // Add the field with default value
    await updateDoc(doc(db, 'drivers', driverDoc.id), {
      is_invisible: false
    })

    console.log(`✅ Updated ${driverDoc.id} - added is_invisible: false`)
    updated++
  }

  console.log('\n📊 Migration Summary:')
  console.log(`   ✅ Updated: ${updated} drivers`)
  console.log(`   ⏭️  Skipped: ${skipped} drivers`)
  console.log('🎉 Migration complete!')
}

// Run migration
migrateDrivers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
