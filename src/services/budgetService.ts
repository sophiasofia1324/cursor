import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { Budget } from '../types';

export const setBudget = async (userId: string, budget: Omit<Budget, 'id'>) => {
  try {
    const budgetRef = doc(collection(db, 'budgets'), userId);
    await setDoc(budgetRef, {
      ...budget,
      updatedAt: Timestamp.now()
    });
    return budgetRef.id;
  } catch (error) {
    console.error('Error setting budget:', error);
    throw error;
  }
};

export const getBudget = async (userId: string): Promise<Budget | null> => {
  try {
    const budgetRef = doc(collection(db, 'budgets'), userId);
    const budgetDoc = await getDoc(budgetRef);
    
    if (budgetDoc.exists()) {
      return {
        id: budgetDoc.id,
        ...budgetDoc.data()
      } as Budget;
    }
    return null;
  } catch (error) {
    console.error('Error getting budget:', error);
    throw error;
  }
}; 