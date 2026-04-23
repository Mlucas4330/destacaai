import type { Context, MiddlewareHandler, Next } from 'hono'
import { verifyJWT } from '../lib/jwt.js'

type Variables = { userId: string }

export const authMiddleware: MiddlewareHandler<{ Variables: Variables }> = async (
  c: Context<{ Variables: Variables }>,
  next: Next,
) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  try {
    const { userId } = await verifyJWT(authHeader.slice(7))
    c.set('userId', userId)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
