const express = require('express');
const next = require('next');
const cors = require('cors');
const { Router } = require('./routes');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT, 10) || 6969;
const app = next({ dev });
const handle = app.getRequestHandler();
const { getShows, getShow, getAllShowSickPicks } = require('./lib/getShows');

app.prepare().then(() => {
  const server = express();
  server.use(cors());

  // API endpoints
  server.get('/api/shows', (req, res) => {
    res.json(getShows());
  });

  server.get('/api/shows/latest', (req, res) => {
    const show = getShows()[0];
    if (show) {
      res.json(show);
      return;
    }
    res.status(404).json({ message: 'Sorry not found' });
  });

  server.get('/api/shows/:number', (req, res) => {
    const show = getShow(req.params.number);
    if (show) {
      res.json(show);
      return;
    }
    res.status(404).json({ message: 'Sorry not found' });
  });

  server.get('/api/sickpicks', (req, res) => {
    res.json(getAllShowSickPicks());
  });

  // Custom Next.js URLs
  Router.forEachPrettyPattern((page, pattern, defaultParams) => {
    server.get(pattern, (req, res) => {
      app.render(req, res, `/${page}`, {
        ...defaultParams,
        ...req.query,
        ...req.params,
      });
    });
  });

  // everything else
  server.get('*', (req, res) => handle(req, res));
  server.listen(port, () => `Listening on ${port}`);
});
