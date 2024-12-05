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
export interface Race {
    id?: string;
    name: string;
    date: string;
    location: string;
    result: string;
    status: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// operasi CRUD
export const firestoreService = {
    // get collection ref
    getRaceRef() {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return collection(db, 'users', uid, 'races');
    },

		// create
    async addRace(race: Omit<Race, 'id'>) {
        try {
            const raceRef = this.getRaceRef();
            const docRef = await addDoc(raceRef, {
                ...race,
                status: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error Tambah Race:', error);
            throw error;
        }
    },

		// read
    async getRaces(): Promise<Race[]> {
        try {
            const raceRef = this.getRaceRef();
            const q = query(raceRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Race));
        } catch (error) {
            console.error('Error Get Races:', error);
            throw error;
        }
    },

		// update
    async updateRace(id: string, race: Partial<Race>) {
        try {
            const raceRef = this.getRaceRef();
            const docRef = doc(raceRef, id);
            await updateDoc(docRef, {
                ...race,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error Update Race:', error);
            throw error;
        }
    },

		// delete
    async deleteRace(id: string) {
        try {
            const raceRef = this.getRaceRef();
            const docRef = doc(raceRef, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error Delete Race:', error);
            throw error;
        }
    }

}