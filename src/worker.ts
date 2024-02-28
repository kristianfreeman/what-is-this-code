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
  const schema = `
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE [Genre]
(
    [GenreId] INTEGER  NOT NULL,
    [Name] NVARCHAR(120),
    CONSTRAINT [PK_Genre] PRIMARY KEY  ([GenreId])
);
  `

  const prompt = `
### Task
Generate a SQL query to answer [QUESTION]${code}[/QUESTION]

### Database Schema
The query will run on a database with the following schema:
${schema}

### Answer
Given the database schema, here is the SQL query that [QUESTION]{user_question}[/QUESTION]
[SQL]
  `
  try {
    const { response } = await ai.run('@cf/defog/sqlcoder-7b-2', { 
      prompt,
      raw: true
    });
    return c.json({ prompt, response, success: true });
  } catch (err: any) {
    return c.json({ error: err.toString(), success: false })
  }
})

export default app
