import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { data } = await req.json();

        let result;
        if (data.id) {
            const { id, created_date, updated_date, created_by, ...updateData } = data;
            result = await base44.asServiceRole.entities.BlogPost.update(id, updateData);
        } else {
            result = await base44.asServiceRole.entities.BlogPost.create(data);
        }

        return Response.json({ success: true, result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});