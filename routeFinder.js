const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/route-finder/route
router.post('/route', auth, async (req, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&alternatives=true&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ success: false, message: data.error_message || 'Could not find route' });
    }

    // Process routes and add safety info
    const routes = data.routes.map((route, index) => ({
      index,
      summary: route.summary,
      distance: route.legs[0].distance.text,
      duration: route.legs[0].duration.text,
      steps: route.legs[0].steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]+>/g, ''),
        distance: step.distance.text,
        duration: step.duration.text
      })),
      polyline: route.overview_polyline.points,
      // Simple safety score (based on highway usage — more detailed logic can be added)
      safetyScore: route.summary.includes('NH') || route.summary.includes('National') ? 90 : 75,
      safetyTips: [
        'Inform someone about your travel plan',
        'Keep emergency contacts ready',
        'Avoid travelling after dark in remote areas',
        'Keep your phone charged'
      ]
    }));

    // Sort by safety score
    routes.sort((a, b) => b.safetyScore - a.safetyScore);

    res.json({ success: true, routes, recommendedRoute: routes[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/route-finder/nearby-safety?lat=&lng=
router.get('/nearby-safety', auth, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const [hospitalRes, policeRes] = await Promise.all([
      fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=hospital&key=${apiKey}`),
      fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=police&key=${apiKey}`)
    ]);

    const [hospitals, police] = await Promise.all([hospitalRes.json(), policeRes.json()]);

    res.json({
      success: true,
      nearbyHospitals: hospitals.results?.slice(0, 3).map(p => ({ name: p.name, vicinity: p.vicinity })) || [],
      nearbyPolice: police.results?.slice(0, 3).map(p => ({ name: p.name, vicinity: p.vicinity })) || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
