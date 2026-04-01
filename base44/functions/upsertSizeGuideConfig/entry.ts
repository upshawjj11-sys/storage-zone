import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { data } = await req.json();

        const existing = await base44.asServiceRole.entities.SizeGuideConfig.list();
        let result;
        if (existing.length > 0) {
            result = await base44.asServiceRole.entities.SizeGuideConfig.update(existing[0].id, data);
        } else {
            result = await base44.asServiceRole.entities.SizeGuideConfig.create(data);
        }

        return Response.json({ success: true, result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});