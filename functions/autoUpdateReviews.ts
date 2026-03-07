import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all facilities with Google Place IDs
    const facilities = await base44.asServiceRole.entities.Facility.list();
    const facilitiesWithPlaceIds = facilities.filter(f => f.google_place_id);

    if (facilitiesWithPlaceIds.length === 0) {
      return Response.json({ message: 'No facilities with Google Place IDs found' });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Google Places API key not configured' }, { status: 500 });
    }

    const results = [];

    for (const facility of facilitiesWithPlaceIds) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(facility.google_place_id)}&fields=reviews,name&key=${apiKey}`
        );

        const data = await response.json();

        if (response.ok && data.status === 'OK') {
          const reviews = (data.result?.reviews || []).map((r) => ({
            name: r.author_name,
            rating: r.rating,
            text: r.text,
            date: r.time ? new Date(r.time * 1000).toISOString().split('T')[0] : '',
          }));

          // Update facility with latest reviews
          await base44.asServiceRole.entities.Facility.update(facility.id, {
            reviews: reviews
          });

          results.push({
            facilityId: facility.id,
            facilityName: facility.name,
            reviewsCount: reviews.length,
            status: 'success'
          });
        } else {
          results.push({
            facilityId: facility.id,
            facilityName: facility.name,
            status: 'error',
            error: data.error_message || 'Failed to fetch reviews'
          });
        }
      } catch (error) {
        results.push({
          facilityId: facility.id,
          facilityName: facility.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({ results, totalFacilities: facilitiesWithPlaceIds.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});