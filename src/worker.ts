import { Ai } from '@cloudflare/ai'
import { Hono } from 'hono'

type Bindings = {
  AI: any
}

import template from './template.html'

const app = new Hono<{ Bindings: Bindings }>()

app.get("/", async c => {
  return c.html(template)
})

app.post("/process", async c => {
  const body = await c.req.json()
  const code = body.code || "n/a"

  const ai = new Ai(c.env.AI);

  const systemMessage = 'You are a code interpreter that describes, in simple terms, what the code provided by the user does. Return your description as Markdown.'

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: code }
  ];

  try {
    const { response } = await ai.run('@hf/thebloke/codellama-7b-instruct-awq', { messages });
    return c.json({ response, success: true });
  } catch (err: any) {
    return c.json({ ...err, success: false })
  }
})

export default app
