import { ID, Avatars, Account, Databases, Client, Query } from 'react-native-appwrite';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.rlandrydev.aora',
  projectID: '663b0467002a0c71ae61',
  databaseID: '663b070a000ff91eb7f6',
  userCollectionId: '663b07540036405f039a',
  videoCollectionId: '663b077e00054cd31d6d',
  storageId: '663b0907002231f0eab6'
}

const {
  endpoint,
  platform,
  projectID,
  databaseID,
  userCollectionId,
  videoCollectionId,
  storageId
} = config;

// Init your React Native SDK
const client = new Client();

//use config variables from above
client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectID) // Your project ID
  .setPlatform(config.platform) // Your application ID or bundle ID.
;
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);


export const createUser = async (email, password, username) => {
  try {
    //Register User
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )

    //if newAccount false, throw Error
    if(!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username)

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseID,
      config.userCollectionId,
      ID.unique(),
      {
        accountID: newAccount.$id,
        email,
        username,
        avatar: avatarUrl
      }
    )

    return newUser;

  } catch (error) {
    console.log(error);
    throw new Error(error);
  } 
  // Register User
  // account.create(ID.unique(), 'me@example.com', 'password', 'Jane Doe')
  //   .then(function (response) {
  //       console.log(response);
  //   }, function (error) {
  //       console.log(error);
  //   });
}

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password)
    return session;
    
  } catch (error) {
    console.log(error);
    throw new Error(error);    
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if(!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseID,
      config.userCollectionId,
      [Query.equal('accountID', currentAccount.$id)]
    )

    if(!currentUser) throw Error;

    return currentUser.documents[0];
    
  } catch (error) {
    console.log(error);    
  }
}

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseID,
      videoCollectionId
    )

    return posts.documents;
    
  } catch (error) {
    console.log(error);
    throw new Error(error);    
  }
}



