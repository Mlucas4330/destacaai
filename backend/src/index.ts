import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoute from './routes/auth.js'
import usersRoute from './routes/users.js'
import cvRoute from './routes/cv.js'
import jobsRoute from './routes/jobs.js'
import generateRoute from './routes/generate.js'
import atsRoute from './routes/ats.js'
import stripeRoute from './routes/stripe.js'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.get('/health', (c) => c.json({ ok: true }))

app.route('/auth', authRoute)
app.route('/users', usersRoute)
app.route('/cv', cvRoute)
app.route('/jobs', jobsRoute)
app.route('/generate', generateRoute)
app.route('/ats', atsRoute)
app.route('/stripe', stripeRoute)

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on port ${port}`)
})
