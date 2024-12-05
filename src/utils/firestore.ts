// src/utils/firestore.ts
import { auth, db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';

// interface data
export interface story {
    id?: string;
    name: string;
    date: string;
    location: string;
    story: string;
    status: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// operasi CRUD
export const firestoreService = {
    // get collection ref
    getStoryRef() {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return collection(db, 'users', uid, 'story');
    },

		// create
    async addStory(story: Omit<story, 'id'>) {
        try {
            const storyRef = this.getStoryRef();
            const docRef = await addDoc(storyRef, {
                ...story,
                status: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Tidak dapat menambahkan cerita:', error);
            throw error;
        }
    },

		// read
    async getStory(): Promise<story[]> {
        try {
            const storyRef = this.getStoryRef();
            const q = query(storyRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as story));
        } catch (error) {
            console.error('Error Get Story:', error);
            throw error;
        }
    },

		// update
    async updateStory(id: string, story: Partial<story>) {
        try {
            const storyRef = this.getStoryRef();
            const docRef = doc(storyRef, id);
            await updateDoc(docRef, {
                ...story,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error Update Story:', error);
            throw error;
        }
    },

		// delete
    async deleteStory(id: string) {
        try {
            const storyRef = this.getStoryRef();
            const docRef = doc(storyRef, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error Delete Story:', error);
            throw error;
        }
    }

}