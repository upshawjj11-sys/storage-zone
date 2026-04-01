import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const [
            siteSettings,
            homePageConfig,
            facilities,
            staticPages,
            pageConfigs,
            brandingKit,
            formConfigs,
            sizeGuideConfig,
            blogPosts,
            popups,
        ] = await Promise.all([
            base44.asServiceRole.entities.SiteSettings.list(),
            base44.asServiceRole.entities.HomePageConfig.list(),
            base44.asServiceRole.entities.Facility.list(),
            base44.asServiceRole.entities.StaticPage.list(),
            base44.asServiceRole.entities.PageConfig.list(),
            base44.asServiceRole.entities.BrandingKit.list(),
            base44.asServiceRole.entities.FormConfig.list(),
            base44.asServiceRole.entities.SizeGuideConfig.list(),
            base44.asServiceRole.entities.BlogPost.list(),
            base44.asServiceRole.entities.Popup.list(),
        ]);

        return Response.json({
            siteSettings: siteSettings[0] || null,
            homePageConfig: homePageConfig[0] || null,
            facilities,
            staticPages,
            pageConfigs,
            brandingKit: brandingKit[0] || null,
            formConfigs,
            sizeGuideConfig: sizeGuideConfig[0] || null,
            blogPosts,
            popups,
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});