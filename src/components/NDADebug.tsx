import React, { useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

export default function NDADebug() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  };

  const clearLogs = () => setLogs([]);

  const debug1_allNdas = async () => {
    clearLogs();
    addLog('=== DEBUG 1: ALL NDAs ===');
    try {
      const snap = await getDocs(collection(db, 'ndas'));
      addLog(`✅ Total NDAs: ${snap.size}`);
      
      if (snap.size === 0) {
        addLog('❌ NO NDAs EXIST AT ALL');
      } else {
        snap.docs.forEach((doc) => {
          const data = doc.data();
          addLog(`\n📄 NDA ID: ${doc.id}`);
          addLog(`  buyerUid: ${data.buyerUid}`);
          addLog(`  sellerUid: ${data.sellerUid}`);
          addLog(`  dealId: ${data.dealId}`);
          addLog(`  status: ${data.status}`);
          addLog(`  createdAt: ${data.createdAt?.toDate()}`);
        });
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  const debug2_userProfile = async () => {
    clearLogs();
    addLog('=== DEBUG 2: USER PROFILE ===');
    
    if (!user) {
      addLog('❌ No user logged in');
      return;
    }

    try {
      const snap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      
      if (snap.empty) {
        addLog('❌ User profile NOT FOUND in Firestore!');
        return;
      }

      const userData = snap.docs[0].data();
      addLog(`✅ User Profile Found:`);
      addLog(`   UID: ${user.uid}`);
      addLog(`   Email: ${user.email}`);
      addLog(`   Role: ${userData.role}`);
      addLog(`   KYC Status: ${userData.kycStatus}`);
      addLog(`   Name: ${userData.name}`);
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  const debug3_sellerNdas = async () => {
    clearLogs();
    addLog('=== DEBUG 3: NDAs FOR THIS SELLER ===');
    
    if (!user) {
      addLog('❌ No user logged in');
      return;
    }

    try {
      const snap = await getDocs(
        query(collection(db, 'ndas'), where('sellerUid', '==', user.uid))
      );
      
      addLog(`✅ NDAs found for this seller: ${snap.size}`);
      
      if (snap.size === 0) {
        addLog('ℹ️  No NDA requests yet');
      } else {
        snap.docs.forEach((doc) => {
          const data = doc.data();
          addLog(`\n📄 ${doc.id}`);
          addLog(`  Buyer UID: ${data.buyerUid}`);
          addLog(`  Deal ID: ${data.dealId}`);
          addLog(`  Status: ${data.status}`);
        });
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
      if (err.code === 'failed-precondition') {
        addLog('⚠️  Missing Firestore Index!');
      }
      if (err.code === 'permission-denied') {
        addLog('⚠️  Permission Denied - Check firestore.rules');
      }
    }
  };

  const debug4_publishedDeals = async () => {
    clearLogs();
    addLog('=== DEBUG 4: PUBLISHED DEALS ===');

    try {
      const snap = await getDocs(
        query(collection(db, 'deals'), where('status', '==', 'published'))
      );
      
      addLog(`✅ Published deals: ${snap.size}`);
      
      if (snap.size === 0) {
        addLog('❌ No published deals found');
      } else {
        snap.docs.forEach((doc) => {
          const data = doc.data();
          addLog(`\n📄 ${doc.id}: "${data.title}"`);
          addLog(`  Seller UID: ${data.sellerUid}`);
          addLog(`  Status: ${data.status}`);
        });
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  const debug5_createTestNda = async () => {
    clearLogs();
    addLog('=== DEBUG 5: CREATE TEST NDA ===');

    if (!user) {
      addLog('❌ No user logged in');
      return;
    }

    try {
      // Find first published deal
      const dealSnap = await getDocs(
        query(collection(db, 'deals'), where('status', '==', 'published'))
      );

      if (dealSnap.empty) {
        addLog('❌ No published deals to test with');
        return;
      }

      const dealDoc = dealSnap.docs[0];
      const deal = dealDoc.data();

      addLog(`Found Deal: "${deal.title}"`);
      addLog(`Deal ID: ${dealDoc.id}`);
      addLog(`Deal sellerUid: ${deal.sellerUid}`);

      if (!deal.sellerUid) {
        addLog('❌ PROBLEM: Deal has NO sellerUid!');
        return;
      }

      if (deal.sellerUid === 'sample-seller') {
        addLog('⚠️  Deal has sample-seller - skipping');
        return;
      }

      const ndaId = `test_${user.uid}_${Date.now()}`;

      await addDoc(collection(db, 'ndas'), {
        dealId: dealDoc.id,
        buyerUid: user.uid,
        sellerUid: deal.sellerUid,
        buyerEmail: user.email,
        status: 'requested',
        createdAt: serverTimestamp(),
        signatureData: {
          signerName: 'Debug Test',
          timestamp: new Date().toISOString(),
        },
      });

      addLog('✅ TEST NDA CREATED!');
      addLog(`Seller UID: ${deal.sellerUid}`);
      addLog(`Now seller should see this NDA request in Dashboard`);
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
      addLog(`Error Code: ${err.code}`);
    }
  };

  const debug6_auditLogs = async () => {
    clearLogs();
    addLog('=== DEBUG 6: NDA AUDIT LOGS ===');

    try {
      const snap = await getDocs(
        query(
          collection(db, 'auditLogs'),
          where('action', 'in', [
            'nda_signed_digitally',
            'nda_request_failed_missing_seller',
            'nda_creation_error',
          ])
        )
      );

      addLog(`NDA-related logs: ${snap.size}`);

      if (snap.size === 0) {
        addLog('No NDA audit logs found');
      } else {
        snap.docs.forEach((doc) => {
          const log = doc.data();
          addLog(`\n${log.action}`);
          addLog(`  Actor: ${log.actorUid}`);
          addLog(`  Deal: ${log.dealId}`);
          addLog(`  Metadata: ${JSON.stringify(log.metadata)}`);
        });
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  const quickSummary = async () => {
    clearLogs();
    addLog('=== QUICK SUMMARY ===\n');

    if (!user) {
      addLog('❌ No user');
      return;
    }

    try {
      const [allNdas, myNdas, allDeals, myDeals] = await Promise.all([
        getDocs(collection(db, 'ndas')),
        getDocs(query(collection(db, 'ndas'), where('sellerUid', '==', user.uid))),
        getDocs(query(collection(db, 'deals'), where('status', '==', 'published'))),
        getDocs(query(collection(db, 'deals'), where('sellerUid', '==', user.uid))),
      ]);

      addLog(`Total NDAs: ${allNdas.size}`);
      addLog(`NDAs for ME (seller): ${myNdas.size}`);
      addLog(`Published Deals: ${allDeals.size}`);
      addLog(`MY Deals: ${myDeals.size}`);

      if (allNdas.size === 0) {
        addLog('\n⚠️  No NDAs - buyers haven\'t requested any yet');
      }
      if (allDeals.size === 0) {
        addLog('\n⚠️  No published deals - create test deals first');
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex justify-between items-center"
        >
          {t('debug.nda_debug')}
          <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={quickSummary}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                {t('debug.summary')}
              </button>
              <button
                onClick={debug1_allNdas}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                {t('debug.all_ndas')}
              </button>
              <button
                onClick={debug2_userProfile}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                {t('debug.profile')}
              </button>
              <button
                onClick={debug3_sellerNdas}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                {t('debug.my_ndas')}
              </button>
              <button
                onClick={debug4_publishedDeals}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                {t('debug.deals')}
              </button>
              <button
                onClick={debug5_createTestNda}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded"
              >
                {t('debug.create_test')}
              </button>
              <button
                onClick={debug6_auditLogs}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                {t('debug.logs')}
              </button>
              <button
                onClick={clearLogs}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
              >
                {t('debug.clear')}
              </button>
            </div>

            <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">{t('debug.empty')}</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap break-words">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
