import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { authMiddleware } from '../middleware/auth.js'

type Variables = { userId: string }

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.get('/me', async (c) => {
  const userId = c.get('userId')
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(formatUser(user))
})

app.post('/me', async (c) => {
  const userId = c.get('userId')
  const { email } = await c.req.json<{ email: string }>()

  const [user] = await db
    .insert(users)
    .values({ id: userId, email })
    .onConflictDoUpdate({ target: users.id, set: { email } })
    .returning()

  return c.json(formatUser(user))
})

function formatUser(user: typeof users.$inferSelect) {
  const now = new Date()
  const resetDate = new Date(user.generationsResetAt)
  resetDate.setDate(resetDate.getDate() + 30)
  const needsReset = now > resetDate

  return {
    id: user.id,
    email: user.email,
    tier: user.tier,
    generationsUsed: needsReset ? 0 : user.generationsUsedThisMonth,
    generationsLimit: user.tier === 'paid' ? -1 : 5,
    cvFileName: user.cvFileName,
    hasCv: !!user.cvR2Key,
  }
}

export default app
