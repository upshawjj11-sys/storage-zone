import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { slug } = await req.json();

        const existing = await base44.asServiceRole.entities.Facility.filter({ slug });
        if (existing && existing.length > 0) {
            await base44.asServiceRole.entities.Facility.delete(existing[0].id);
            return Response.json({ success: true });
        }

        return Response.json({ success: false, message: "Facility not found" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});