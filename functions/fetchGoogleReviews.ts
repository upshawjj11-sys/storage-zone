import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { placeId } = await req.json();

    if (!placeId) {
      return Response.json({ error: 'placeId is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Google Places API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${apiKey}`
    );

    const data = await response.json();

    if (!response.ok || data.status !== 'OK') {
      return Response.json({ error: data.error_message || 'Failed to fetch reviews' }, { status: 400 });
    }

    const reviews = (data.result?.reviews || []).map((r) => ({
      name: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.time ? new Date(r.time * 1000).toISOString().split('T')[0] : '',
    }));

    return Response.json({ reviews });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});