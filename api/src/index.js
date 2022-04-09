import express from 'express';
import { v4 as uuidV4 } from 'uuid';
import { Ingest, Search } from 'sonic-channel';

const app = express();
app.use(express.json());

const sonicConfig = {
  host: 'localhost',
  port: 1491,
  auth: 'SecretPassword',
};
const sonicChannelIngest = new Ingest(sonicConfig);
const sonicChannelSearch = new Search(sonicConfig);

sonicChannelIngest.connect({
  connected: () => console.log('[Sonic Ingest Channel] Connected!'),
});
sonicChannelSearch.connect({
  connected: () => console.log('[Sonic Search Channel] Connected!'),
});

app.post('/pages', async (request, response) => {
  const { title, content } = request.body;
  const id = uuidV4();

  // TODO: Save page on database

  // Save on search engine
  await sonicChannelIngest.push('pages', 'default', `page:${id}`, `${title} ${content}`, {
    lang: 'por',
  });

  return response.status(201).send();
});

app.get('/search', async (request, response) => {
  const { q } = request.query;

  const results = await sonicChannelSearch.query('pages', 'default', q, {
    lang: 'por',
  });

  return response.json(results);
});

app.get('/suggest', async (request, response) => {
  const { q } = request.query;

  const results = await sonicChannelSearch.suggest('pages', 'default', q, {
    limit: 5,
  });
  return response.json(results);
});

app.listen(3333, () => console.log("[Sonic Search API] Running on port 3333"));
