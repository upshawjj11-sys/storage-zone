import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { data } = await req.json();

        // Strip App B's ID so we don't try to use it as App A's ID
        const { id, created_date, updated_date, created_by, ...fields } = data;

        let result;
        let action;

        // Match by slug in App A's database
        if (fields.slug) {
            const existing = await base44.asServiceRole.entities.StaticPage.filter({ slug: fields.slug });
            if (existing && existing.length > 0) {
                result = await base44.asServiceRole.entities.StaticPage.update(existing[0].id, fields);
                action = "updated";
            } else {
                result = await base44.asServiceRole.entities.StaticPage.create(fields);
                action = "created";
            }
        } else {
            result = await base44.asServiceRole.entities.StaticPage.create(fields);
            action = "created";
        }

        return Response.json({ success: true, action, id: result.id });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});