import { app } from '@azure/functions';
import crypto from 'crypto';

app.http('bookingConfirmation', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'confirmation',
  handler: async (request, context) => {
    const body = await request.json().catch(() => ({}));
    if (!body.bookingId || !body.eventTitle || !body.userEmail) {
      return { status: 400, jsonBody: { message: 'bookingId, eventTitle and userEmail are required.' } };
    }

    const confirmationCode = `CC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    context.log(`Confirmation ${confirmationCode} created for booking ${body.bookingId}`);

    return {
      status: 200,
      jsonBody: {
        confirmationCode,
        bookingId: body.bookingId,
        eventTitle: body.eventTitle,
        userEmail: body.userEmail,
        generatedAt: new Date().toISOString()
      }
    };
  }
});
