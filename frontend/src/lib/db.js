import Dexie from 'dexie';

export const db = new Dexie('NestNagarDB');

db.version(1).stores({
  messages: '++id, conversationId, senderId, text, createdAt, status, tempId, readBy, reactions, replyTo, synced',
  conversations: '++id, _id, participants, lastMessage, unreadCount, contextType, contextId, updatedAt',
  listings: '++id, _id, title, price, locality, type, photos, posterRole, amenities, genderAllowed, createdAt, views, status, cachedAt',
  drafts: '++id, conversationId, text, createdAt',
  userPrefs: '++id, key, value',
});

export const saveMessage = async (message) => {
  await db.messages.put({
    ...message,
    cachedAt: Date.now(),
    synced: false,
  });
};

export const getMessages = async (conversationId) => {
  return await db.messages
    .where('conversationId')
    .equals(conversationId)
    .reverse()
    .sortBy('createdAt');
};

export const markMessageSynced = async (tempId, realId) => {
  await db.messages.where('tempId').equals(tempId).modify({ synced: true, _id: realId });
};

export const saveDraft = async (conversationId, text) => {
  await db.drafts.put({ conversationId, text, createdAt: Date.now() });
};

export const getDraft = async (conversationId) => {
  return await db.drafts.where('conversationId').equals(conversationId).first();
};

export const clearDraft = async (conversationId) => {
  await db.drafts.where('conversationId').equals(conversationId).delete();
};

export const saveConversations = async (conversations) => {
  await db.conversations.bulkPut(conversations.map(c => ({ ...c, cachedAt: Date.now() })));
};

export const getConversations = async () => {
  return await db.conversations.toArray();
};

export const saveListings = async (listings) => {
  await db.listings.bulkPut(listings.map(l => ({ ...l, cachedAt: Date.now() })));
};

export const getCachedListings = async (params = {}) => {
  let collection = db.listings.toCollection();
  
  if (params.locality) {
    collection = collection.filter(l => l.locality?.toLowerCase().includes(params.locality.toLowerCase()));
  }
  if (params.type) {
    collection = collection.filter(l => l.type === params.type);
  }
  if (params.minPrice) {
    collection = collection.filter(l => l.price >= params.minPrice);
  }
  if (params.maxPrice) {
    collection = collection.filter(l => l.price <= params.maxPrice);
  }
  
  return await collection.reverse().sortBy('createdAt');
};

export const setUserPref = async (key, value) => {
  await db.userPrefs.put({ key, value, updatedAt: Date.now() });
};

export const getUserPref = async (key) => {
  const record = await db.userPrefs.get(key);
  return record?.value;
};