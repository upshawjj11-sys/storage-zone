import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const data = body.data || body;
        const { id, created_date, updated_date, created_by, ...fields } = data;

        let result;
        let action;

        if (fields.title) {
            const existing = await base44.asServiceRole.entities.Popup.filter({ title: fields.title });
            if (existing && existing.length > 0) {
                result = await base44.asServiceRole.entities.Popup.update(existing[0].id, fields);
                action = "updated";
            } else {
                result = await base44.asServiceRole.entities.Popup.create(fields);
                action = "created";
            }
        } else {
            result = await base44.asServiceRole.entities.Popup.create(fields);
            action = "created";
        }

        return Response.json({ success: true, action, id: result.id });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});