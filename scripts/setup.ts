import {
  createDatabase,
  createUsersCollection,
  createMaterialsCollection,
  createStudyGroupsCollection,
  createTagsCollection,
} from "./setup-database"

async function setupDatabase() {
  console.log("🚀 Starting database setup...")

  try {
    // Create database
    const databaseId = await createDatabase()
    console.log("📦 Database ID:", databaseId)

    // Create collections
    const usersCollectionId = await createUsersCollection(databaseId)
    console.log("👥 Users Collection ID:", usersCollectionId)

    const materialsCollectionId = await createMaterialsCollection(databaseId)
    console.log("📚 Materials Collection ID:", materialsCollectionId)

    const studyGroupsCollectionId = await createStudyGroupsCollection(databaseId)
    console.log("👥 Study Groups Collection ID:", studyGroupsCollectionId)

    const tagsCollectionId = await createTagsCollection(databaseId)
    console.log("🏷️ Tags Collection ID:", tagsCollectionId)

    console.log("✨ Database setup completed successfully!")

    // Save collection IDs to .env file
    const envContent = `
NEXT_PUBLIC_APPWRITE_DATABASE_ID=${databaseId}
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersCollectionId}
NEXT_PUBLIC_APPWRITE_MATERIALS_COLLECTION_ID=${materialsCollectionId}
NEXT_PUBLIC_APPWRITE_STUDY_GROUPS_COLLECTION_ID=${studyGroupsCollectionId}
NEXT_PUBLIC_APPWRITE_TAGS_COLLECTION_ID=${tagsCollectionId}
    `.trim()

    console.log("\n📝 Add these variables to your .env file:")
    console.log(envContent)
  } catch (error) {
    console.error("❌ Setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()

