"use client"

import { Client, Databases, ID, Permission, Role } from "appwrite"

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const databases = new Databases(client)

async function createDatabase() {
  try {
    const database = await databases.create(ID.unique(), "StudPal Database")

    console.log("✅ Database created:", database.$id)
    return database.$id
  } catch (error) {
    console.error("❌ Error creating database:", error)
    throw error
  }
}

async function createUsersCollection(databaseId: string) {
  try {
    const collection = await databases.createCollection(databaseId, ID.unique(), "Users", [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])

    // Add attributes
    await databases.createStringAttribute(databaseId, collection.$id, "name", 100, true)

    await databases.createEmailAttribute(databaseId, collection.$id, "email", true)

    await databases.createEnumAttribute(
      databaseId,
      collection.$id,
      "major",
      ["cs", "biology", "business", "engineering", "other"],
      true,
    )

    await databases.createEnumAttribute(
      databaseId,
      collection.$id,
      "academicYear",
      ["freshman", "sophomore", "junior", "senior", "graduate"],
      true,
    )

    await databases.createDatetimeAttribute(databaseId, collection.$id, "createdAt", true)

    // Add indexes
    await databases.createIndex(databaseId, collection.$id, "email_index", "key", ["email"], true)

    console.log("✅ Users collection created")
    return collection.$id
  } catch (error) {
    console.error("❌ Error creating users collection:", error)
    throw error
  }
}

async function createMaterialsCollection(databaseId: string) {
  try {
    const collection = await databases.createCollection(databaseId, ID.unique(), "Materials", [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])

    // Add attributes
    await databases.createStringAttribute(databaseId, collection.$id, "userId", 36, true)

    await databases.createStringAttribute(databaseId, collection.$id, "title", 255, true)

    await databases.createEnumAttribute(databaseId, collection.$id, "type", ["note", "pdf", "link"], true)

    await databases.createStringAttribute(databaseId, collection.$id, "content", 65535, false)

    await databases.createStringAttribute(databaseId, collection.$id, "url", 2048, false)

    await databases.createStringAttribute(databaseId, collection.$id, "fileId", 36, false)

    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      "tags",
      100,
      false,
      true, // isArray
    )

    await databases.createEnumAttribute(databaseId, collection.$id, "priority", ["high", "medium", "low"], true)

    await databases.createDatetimeAttribute(databaseId, collection.$id, "createdAt", true)

    await databases.createDatetimeAttribute(databaseId, collection.$id, "updatedAt", true)

    // Add indexes
    await databases.createIndex(databaseId, collection.$id, "user_materials", "key", ["userId"])

    await databases.createIndex(databaseId, collection.$id, "material_type", "key", ["type"])

    console.log("✅ Materials collection created")
    return collection.$id
  } catch (error) {
    console.error("❌ Error creating materials collection:", error)
    throw error
  }
}

async function createStudyGroupsCollection(databaseId: string) {
  try {
    const collection = await databases.createCollection(databaseId, ID.unique(), "Study Groups", [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])

    // Add attributes
    await databases.createStringAttribute(databaseId, collection.$id, "name", 255, true)

    await databases.createStringAttribute(databaseId, collection.$id, "description", 1000, false)

    await databases.createStringAttribute(databaseId, collection.$id, "ownerId", 36, true)

    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      "members",
      36,
      true,
      true, // isArray
    )

    await databases.createDatetimeAttribute(databaseId, collection.$id, "createdAt", true)

    // Add indexes
    await databases.createIndex(databaseId, collection.$id, "owner_groups", "key", ["ownerId"])

    console.log("✅ Study Groups collection created")
    return collection.$id
  } catch (error) {
    console.error("❌ Error creating study groups collection:", error)
    throw error
  }
}

async function createTagsCollection(databaseId: string) {
  try {
    const collection = await databases.createCollection(databaseId, ID.unique(), "Tags", [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])

    // Add attributes
    await databases.createStringAttribute(databaseId, collection.$id, "name", 100, true)

    await databases.createStringAttribute(databaseId, collection.$id, "userId", 36, true)

    await databases.createIntegerAttribute(databaseId, collection.$id, "count", true, 0, 0)

    // Add indexes
    await databases.createIndex(databaseId, collection.$id, "user_tags", "key", ["userId"])

    await databases.createIndex(databaseId, collection.$id, "unique_user_tag", "unique", ["userId", "name"])

    console.log("✅ Tags collection created")
    return collection.$id
  } catch (error) {
    console.error("❌ Error creating tags collection:", error)
    throw error
  }
}

