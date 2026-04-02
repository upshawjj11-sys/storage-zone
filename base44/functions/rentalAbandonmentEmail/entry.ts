import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      facility_name,
      facility_address,
      unit_name,
      unit_size,
      unit_type,
      unit_features,
      unit_price,
      customer_name,
      customer_email,
      customer_phone,
      abandoned_at,
      time_on_site_seconds,
      step_reached,
    } = body;

    // Format time on site
    const minutes = Math.floor(time_on_site_seconds / 60);
    const seconds = time_on_site_seconds % 60;
    const timeOnSite = minutes > 0
      ? `${minutes} min ${seconds} sec`
      : `${seconds} sec`;

    // Format abandoned date/time
    const abandonedDate = new Date(abandoned_at).toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const featuresHtml = unit_features?.length
      ? unit_features.map(f => `<li style="margin:2px 0;">${f}</li>`).join("")
      : "<li>None listed</li>";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: #C0392B; padding: 24px 30px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">⚠️ Rental Abandoned</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">A customer started but did not complete their rental.</p>
    </div>

    <!-- Body -->
    <div style="padding: 28px 30px;">

      <!-- Customer Info -->
      <h2 style="font-size: 15px; color: #1B365D; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 14px;">👤 Customer Information</h2>
      <table style="width:100%; font-size:14px; color:#374151; margin-bottom:20px;">
        <tr><td style="padding:4px 0; font-weight:600; width:40%;">Name</td><td>${customer_name || "Not provided"}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Email</td><td><a href="mailto:${customer_email}" style="color:#E8792F;">${customer_email || "Not provided"}</a></td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Phone</td><td>${customer_phone || "Not provided"}</td></tr>
      </table>

      <!-- Unit Info -->
      <h2 style="font-size: 15px; color: #1B365D; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 14px;">📦 Unit Details</h2>
      <table style="width:100%; font-size:14px; color:#374151; margin-bottom:20px;">
        <tr><td style="padding:4px 0; font-weight:600; width:40%;">Facility</td><td>${facility_name || "Unknown"}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Address</td><td>${facility_address || "—"}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Unit</td><td>${unit_name || "—"}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Size</td><td>${unit_size || "—"}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Type</td><td>${unit_type || "—"}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Monthly Price</td><td>${unit_price ? `$${unit_price}/mo` : "—"}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600; vertical-align:top;">Features</td><td><ul style="margin:0; padding-left:18px;">${featuresHtml}</ul></td></tr>
      </table>

      <!-- Abandonment Info -->
      <h2 style="font-size: 15px; color: #1B365D; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 14px;">📊 Session Details</h2>
      <table style="width:100%; font-size:14px; color:#374151; margin-bottom:20px;">
        <tr><td style="padding:4px 0; font-weight:600; width:40%;">Abandoned At</td><td>${abandonedDate} (ET)</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Time on Site</td><td>${timeOnSite}</td></tr>
        <tr><td style="padding:4px 0; font-weight:600;">Last Step Reached</td><td>${step_reached || "Personal Info"}</td></tr>
      </table>

      <div style="background:#fff8f0; border-left:4px solid #E8792F; padding:12px 16px; border-radius:4px; font-size:13px; color:#92400e;">
        💡 Consider reaching out to this customer — they showed strong intent by starting the rental process.
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb; padding:16px 30px; text-align:center; font-size:12px; color:#9ca3af;">
      This is an automated notification from your rental management system.
    </div>
  </div>
</body>
</html>`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rental Alerts <onboarding@resend.dev>",
        to: ["upshawjj11@gmail.com"],
        subject: `🚨 Rental Abandoned — ${customer_name || "Unknown Customer"} at ${facility_name || "Unknown Location"}`,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Email send failed");

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});