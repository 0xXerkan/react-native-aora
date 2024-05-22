import { ID, Avatars, Account, Databases, Client, Query, Storage } from 'react-native-appwrite';

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
const storage = new Storage(client);


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
      videoCollectionId,
      [Query.orderDesc('$createdAt')]
    )

    return posts.documents;
    
  } catch (error) {
    console.log(error);
    throw new Error(error);    
  }
}

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseID,
      videoCollectionId,
      [Query.orderDesc('$createdAt', Query.limit(7))]
    )

    return posts.documents;
    
  } catch (error) {
    console.log(error);
    throw new Error(error);    
  }
}

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      databaseID,
      videoCollectionId,
      [Query.search('title', query)]
    )

    return posts.documents;
    
  } catch (error) {
    console.log(error);
    throw new Error(error);    
  }
}

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      databaseID,
      videoCollectionId,
      [Query.equal('users', userId), Query.orderDesc('$createdAt')]
    )

    return posts.documents;
    
  } catch (error) {
    console.log(error);
    throw new Error(error);    
  }
}

export const signOut = async () => {
  try {
    const session = await account.deleteSession('current');
    return session;    
  } catch (error) {
    throw new Error(error);    
  }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if( type == 'video') {
      fileUrl = storage.getFileView(storageId, fileId)
    } else if(type === 'image') {
      fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
    } else {
      throw new Error('Invalid file type');
    }

    if(!fileUrl) throw Error;

    return fileUrl;

  } catch (error) {
    throw new Error(error);    
  }
}

export const uploadFile = async (file, type) => {
  if(!file) return;

  const asset = { 
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };
  
  // console.log('FILE', file);

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    )
    // console.log('UPLOADED FILE', uploadedFile)
    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;

  } catch (error) {
    throw new Error(error);
  }
}

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ])

    const newPost = await databases.createDocument(
      databaseID,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        prompt: form.prompt,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        users: form.userId
      }
    )

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}


