import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { signJWT } from '../lib/jwt.js'
import { hashPassword, comparePassword } from '../lib/password.js'

const app = new Hono()

app.post('/register', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  if (!email || !password || password.length < 8) {
    return c.json({ error: 'Invalid email or password (min 8 chars)' }, 400)
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  const id = crypto.randomUUID()
  const hash = await hashPassword(password)

  const [user] = await db.insert(users).values({ id, email, passwordHash: hash }).returning()
  const token = await signJWT(id)

  return c.json({ token, user: { id: user.id, email: user.email } }, 201)
})

app.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user || !user.passwordHash) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const token = await signJWT(user.id)
  return c.json({ token, user: { id: user.id, email: user.email } })
})

export default app
