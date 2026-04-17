import { db } from '@/lib/db';
import { webpush, isWebPushConfigured } from '@/lib/webpush';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!isWebPushConfigured) return;

  const subscriptions = await db.pushSubscription.findMany({ where: { userId } });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
    } catch (err: unknown) {
      // Remove expired subscriptions (410 Gone)
      if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 410) {
        await db.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}
