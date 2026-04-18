import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const UPLOADS_COLLECTION = 'uploads';

export const saveUploadToFirestore = async (uploadData) => {
  try {
    const docRef = await addDoc(collection(db, UPLOADS_COLLECTION), {
      image_url: uploadData.image_url || null,
      file_name: uploadData.file_name || 'unknown',
      file_size: uploadData.file_size || 0,
      metadata: uploadData.metadata || { status: 'pending' },
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Firestore Save Error:", error);
    throw error;
  }
};

export const fetchUploadsFromFirestore = async () => {
  try {
    const q = query(collection(db, UPLOADS_COLLECTION), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Firestore Fetch Error:", error);
    throw error;
  }
};

export const updateUploadResult = async (docId, predictionResult) => {
  try {
    const docRef = doc(db, UPLOADS_COLLECTION, docId);
    await updateDoc(docRef, {
      metadata: predictionResult
    });
  } catch (error) {
    console.error("Firestore Update Error:", error);
    throw error;
  }
};
