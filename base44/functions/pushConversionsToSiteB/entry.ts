import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SITE_B_ENDPOINT = 'https://zone-command-base.base44.app/api/functions/receiveSiteAConversions';
const SITE_B_API_KEY = Deno.env.get('SITE_B_API_KEY');

// Sanitize reservation data, removing sensitive info
function sanitizeConversion(reservation) {
  return {
    facility_id: reservation.facility_id,
    facility_name: reservation.facility_name,
    facility_type: reservation.facility_type,
    unit_info: {
      unit_name: reservation.unit_name,
      unit_size: reservation.unit_size,
      unit_price: reservation.unit_price,
      unit_type: reservation.unit_type,
      unit_features: reservation.unit_features,
    },
    customer_info: {
      name: reservation.customer_name,
      email: reservation.customer_email,
      phone: reservation.customer_phone,
    },
    conversion_type: reservation.reservation_type || 'reservation',
    status: reservation.status,
    move_in_date: reservation.move_in_date,
    created_date: reservation.created_date,
    session_data: {
      notes: reservation.notes,
    },
  };
}

// Sanitize abandoned rental data
function sanitizeAbandonedRental(abandoned) {
  return {
    facility_id: abandoned.facility_id,
    facility_name: abandoned.facility_name,
    facility_type: abandoned.facility_type,
    unit_info: {
      unit_name: abandoned.unit_name,
      unit_size: abandoned.unit_size,
      unit_price: abandoned.unit_price,
      unit_type: abandoned.unit_type,
      unit_features: abandoned.unit_features,
    },
    customer_info: {
      name: abandoned.customer_name,
      email: abandoned.customer_email,
      phone: abandoned.customer_phone,
    },
    conversion_type: 'abandoned_rental',
    status: abandoned.status,
    created_date: abandoned.created_date,
    session_data: {
      abandoned_at: abandoned.abandoned_at,
      time_on_site_seconds: abandoned.time_on_site_seconds,
      step_reached: abandoned.step_reached,
    },
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all reservations and abandoned rentals
    const [reservations, abandonedRentals] = await Promise.all([
      base44.asServiceRole.entities.Reservation.list(),
      base44.asServiceRole.entities.AbandonedRental.list(),
    ]);

    // Sanitize all conversions
    const conversions = [
      ...(reservations || []).map(sanitizeConversion),
      ...(abandonedRentals || []).map(sanitizeAbandonedRental),
    ];

    if (!conversions || conversions.length === 0) {
      return Response.json({ message: 'No conversions to push', count: 0 });
    }

    // Push to Site B
    const response = await fetch(SITE_B_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Site-A-Key': SITE_B_API_KEY,
      },
      body: JSON.stringify({
        conversions: conversions,
        pushed_at: new Date().toISOString(),
        count: conversions.length,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Site B returned ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return Response.json({
      success: true,
      message: `Pushed ${conversions.length} conversions to Site B`,
      pushed_count: conversions.length,
      site_b_response: result,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});