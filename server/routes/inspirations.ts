import { Router } from 'express';
import { storage } from '../storage';
import { fetchLatestInspirations } from '../services/inspiration-service';

const router = Router();

// Get all inspirations
router.get('/api/inspirations', async (req, res) => {
  try {
    const inspirations = await storage.getInspirations();
    
    // If we have less than 10 inspirations, fetch new ones
    if (inspirations.length < 10) {
      const newInspirations = await fetchLatestInspirations();
      return res.json(newInspirations);
    }
    
    res.json(inspirations);
  } catch (error) {
    console.error('Error fetching inspirations:', error);
    res.status(500).send('Failed to fetch inspirations');
  }
});

// Refresh inspirations
router.post('/api/inspirations/refresh', async (req, res) => {
  try {
    const newInspirations = await fetchLatestInspirations();
    res.json(newInspirations);
  } catch (error) {
    console.error('Error refreshing inspirations:', error);
    res.status(500).send('Failed to refresh inspirations');
  }
});

export default router;
