// const cl = (txt)=> console.log(txt);
import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.3.11/middleware.ts";
const app = new Hono()
app.use (cors())

const kv = await Deno.openKv();
const DB_KEY = Deno.env.get("DB_KEY")

app.get("/", (c) => {return c.text("Hello")})

// ------------------- BUKET -------------------
app.get(`/${DB_KEY}/:buket`, async (c) => {
  const ar=[], kvVal=[];
  const buket = c.req.param('buket')
  const entries = kv.list({prefix:[`${buket}`]})
  for await (const entry of entries) 
    ar.push([Number(entry.key[1]),entry.value])
  ar.sort((a, b) => {return a[0] - b[0];}).map(i => kvVal.push(i[1]))
  return c.text(kvVal.join(''))
})

app.post(`/${DB_KEY}/:buket`, async (c) => {
  const buket = c.req.param('buket')
  const payload = await c.req.text()
  const entries = kv.list({prefix:[`${buket}`]});
  for await (const entry of entries)
    await kv.delete(entry.key);
  for (let i=0; i < payload.length; i+=49152)
    await kv.set([`${buket}`, `${i}`], payload.slice(i, i+49152));  
  return c.text('ok')
})

app.delete(`/${DB_KEY}/:buket`, async (c) => {
  const buket = c.req.param('buket')
  const entries = kv.list({prefix:[`${buket}`]})
  for await (const entry of entries)
    await kv.delete(entry.key);
  return c.text('ok')
})

export default { fetch: app.fetch };
