import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Expense } from '../types';

export const addExpense = async (expense: Omit<Expense, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expense,
      date: Timestamp.fromDate(expense.date)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getExpenses = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Expense[];
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
}; 