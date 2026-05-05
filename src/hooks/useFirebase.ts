import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export function useDeals(status?: string) {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'deals'), orderBy('createdAt', 'desc'));
    if (status) {
      q = query(q, where('status', '==', status));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeals(dealData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'deals');
    });

    return () => unsubscribe();
  }, [status]);

  return { deals, loading };
}

export function useDeal(dealId: string) {
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealId) return;
    const unsubscribe = onSnapshot(doc(db, 'deals', dealId), (doc) => {
      setDeal(doc.exists() ? { id: doc.id, ...doc.data() } : null);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `deals/${dealId}`);
    });

    return () => unsubscribe();
  }, [dealId]);

  return { deal, loading };
}
