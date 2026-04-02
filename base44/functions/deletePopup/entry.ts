import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { title } = await req.json();

        const existing = await base44.asServiceRole.entities.Popup.filter({ title });
        if (existing && existing.length > 0) {
            await base44.asServiceRole.entities.Popup.delete(existing[0].id);
            return Response.json({ success: true });
        }

        return Response.json({ success: false, message: "Popup not found" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});