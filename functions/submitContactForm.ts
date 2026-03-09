import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { Resend } from 'npm:resend@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { form_id, field_values, facility } = await req.json();

    if (!form_id) {
      return Response.json({ error: 'Missing form_id' }, { status: 400 });
    }

    const forms = await base44.asServiceRole.entities.FormConfig.filter({ id: form_id });
    if (!forms || forms.length === 0) {
      return Response.json({ error: 'Form not found' }, { status: 404 });
    }
    const formConfig = forms[0];

    if (!formConfig.recipient_email) {
      return Response.json({ ok: true, message: 'Submitted (no recipient configured)' });
    }

    const lines = [];
    if (facility) lines.push(`Location: ${facility}`);
    (formConfig.fields || []).forEach(field => {
      const val = field_values[field.id];
      if (val !== undefined && val !== "") {
        lines.push(`${field.label}: ${val}`);
      }
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: formConfig.recipient_email,
      subject: `New form submission: ${formConfig.title || formConfig.name}`,
      body: lines.join('\n'),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});