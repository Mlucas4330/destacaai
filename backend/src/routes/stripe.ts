import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { stripe } from '../lib/stripe.js'
import { authMiddleware } from '../middleware/auth.js'

type Variables = { userId: string }

const app = new Hono<{ Variables: Variables }>()

app.post('/checkout', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) return c.json({ error: 'User not found' }, 404)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PAID_PRICE_ID!, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: userId,
    success_url: `${process.env.FRONTEND_URL}?upgraded=1`,
    cancel_url: `${process.env.FRONTEND_URL}?upgraded=0`,
  })

  return c.json({ checkoutUrl: session.url })
})

app.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return c.json({ error: 'Invalid signature' }, 400)
  }

  switch (event.type) {
  case 'checkout.session.completed': {
    const session = event.data.object
    const uid = session.client_reference_id
    if (uid) {
      await db.update(users).set({
        tier: 'paid',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      }).where(eq(users.id, uid))
    }
    break
  }
  case 'customer.subscription.deleted': {
    const sub = event.data.object
    await db.update(users).set({ tier: 'free', stripeSubscriptionId: null }).where(
      eq(users.stripeSubscriptionId, sub.id),
    )
    break
  }
  case 'customer.subscription.updated': {
    const sub = event.data.object
    if (sub.status === 'past_due' || sub.status === 'canceled') {
      await db.update(users).set({ tier: 'free' }).where(
        eq(users.stripeSubscriptionId, sub.id),
      )
    } else if (sub.status === 'active') {
      await db.update(users).set({ tier: 'paid' }).where(
        eq(users.stripeSubscriptionId, sub.id),
      )
    }
    break
  }
  }

  return c.json({ received: true })
})

export default app
