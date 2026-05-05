import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

type AuditPayload = {
  actorUid?: string | null;
  actorRole?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  dealId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(payload: AuditPayload) {
  if (!payload.actorUid) return;

  await addDoc(collection(db, 'auditLogs'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function writeDataRoomEvent(payload: AuditPayload & { fileName?: string; folder?: string }) {
  if (!payload.actorUid) return;

  await addDoc(collection(db, 'dataRoomEvents'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}
