import express from 'express';

const app = express();
const PORT = 11451;

app.use(express.static('public'));
app.use(express.json());

app.get('/api/scenes', (req, res) => {
  const scenes = {
    typing: {
      id: 'typing',
      type: 'typing',
      nextScene: 'video'
    },
    video: {
      id: 'video',
      type: 'video',
      videoPath: '/videos/scene.mp4',
      hotspots: [],
      nextScene: 'text'
    },
    text: {
      id: 'text',
      type: 'text',
      nextScene: null
    }
  };

  const sceneId = req.query.id || 'typing';
  res.json(scenes[sceneId] || scenes.typing);
});

app.listen(PORT, () => {
  console.log(`Narrative viewer running at http://localhost:${PORT}`);
});
