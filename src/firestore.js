import {
    addDoc,
    getDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    orderBy,
    arrayUnion,
    setDoc,
    where,
    writeBatch,
    or,
    and,
    getCountFromServer,
    runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Type } from '../components/Notifier';

