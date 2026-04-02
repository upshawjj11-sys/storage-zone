import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { facility } = await req.json();

    if (!facility || !facility.id) {
      return Response.json(
        { error: 'Missing facility id in payload' },
        { status: 400 }
      );
    }

    console.log(`[upsertFacility] Updating facility: ${facility.id}`);

    // Extract only the fields that should be updated
    const updateData = {};
    const fieldsToSync = [
      'holiday_hours',
      'features',
      'faqs',
      'pillars',
      'notice_bar',
      'sections_order',
      'page_styles',
      'hours',
      'access_hours',
      'name',
      'slug',
      'address',
      'city',
      'state',
      'zip',
      'phone',
      'email',
      'about',
      'units',
      'reviews',
      'photos',
      'videos',
      'banner_image',
      'banner_title',
      'banner_subtitle',
      'show_pillars',
      'pillars_bg_color',
      'pillars_show_info_button',
      'pillars_info_link'
    ];

    fieldsToSync.forEach(field => {
      if (field in facility) {
        updateData[field] = facility[field];
      }
    });

    // Update the facility using service role
    const updated = await base44.asServiceRole.entities.Facility.update(
      facility.id,
      updateData
    );

    console.log(`[upsertFacility] Successfully updated facility: ${facility.id}`);
    console.log(`[upsertFacility] Fields updated:`, Object.keys(updateData));

    return Response.json({
      success: true,
      facility: updated,
      message: `Facility ${facility.id} updated successfully`
    });
  } catch (error) {
    console.error('[upsertFacility] Error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});