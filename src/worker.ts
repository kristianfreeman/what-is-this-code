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

  const systemMessage = 'Answer the following question by the user'
  const content = `Here is the schema for the database:

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE [Genre]
(
    [GenreId] INTEGER  NOT NULL,
    [Name] NVARCHAR(120),
    CONSTRAINT [PK_Genre] PRIMARY KEY  ([GenreId])
);

${code}
  `

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content }
  ];

  try {
    const { response } = await ai.run('@cf/defog/sqlcoder-7b-2', { messages });
    return c.json({ response, success: true });
  } catch (err: any) {
    return c.json({ error: err.toString(), success: false })
  }
})

export default app
