// GitHub လမ်းကြောင်း: functions/index.js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS Headers Setting (အခြားနေရာကနေ လှမ်းသုံးရင် Error မတက်အောင်)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 1. Database (DB) Binding ရှိမရှိ စစ်ဆေးခြင်း
  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: "D1 Database binding 'DB' ကို ရှာမတွေ့ပါ။ ကျေးဇူးပြု၍ Cloudflare Pages Settings > Functions ထဲမှာ DB Binding ချိတ်ပေးပါ။" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 2. မူရင်း Home Page (URL သက်သက်ပဲ နှိပ်ရင် ပြသမည့် စာမျက်နှာအလှလေး)
    if (path === "/" || path === "") {
      const html = `
        <!DOCTYPE html>
        <html lang="my">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Webnovel API Dashboard</title>
            <style>
                body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; text-align: center; }
                .card { background: #1e293b; max-width: 600px; margin: 2rem auto; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
                h1 { color: #38bdf8; margin-bottom: 0.5rem; }
                p { color: #94a3b8; }
                .btn { display: inline-block; background: #0284c7; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; margin-top: 1rem; font-weight: bold; transition: background 0.2s; }
                .btn:hover { background: #0369a1; }
                .status { color: #4ade80; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>✨ Webnovel API Running</h1>
                <p>ဆရာ့ရဲ့ Cloudflare Pages GitHub API စနစ်သည် အောင်မြင်စွာ အလုပ်လုပ်နေပါပြီ။</p>
                <p>Database အခြေအနေ: <span class="status">ချိတ်ဆက်မှု အောင်မြင်သည် ✓</span></p>
                <hr style="border-color: #334155; margin: 1.5rem 0;">
                <p>ဝတ္ထုစာရင်းအားလုံးကို စမ်းသပ်ကြည့်ရန် အောက်ကခလုတ်ကို နှိပ်ပါ -</p>
                <a href="/api/novels" class="btn">View Novels API 🚀</a>
            </div>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 3. API Route: ဝတ္ထုအားလုံးကို ထုတ်ပြပေးခြင်း (/api/novels)
    if (path === "/api/novels") {
      const { results } = await env.DB.prepare("SELECT * FROM novels").all();
      return new Response(JSON.stringify(results, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // 4. API Route: ဝတ္ထုတစ်ခုချင်းစီရဲ့ အခန်းများ ထုတ်ပြခြင်း (/api/novels/:id/chapters)
    const chapterMatch = path.match(/^\/api\/novels\/(\d+)\/chapters$/);
    if (chapterMatch) {
      const novelId = chapterMatch[1];
      const { results } = await env.DB.prepare("SELECT * FROM chapters WHERE novel_id = ? ORDER BY chapter_number ASC")
        .bind(novelId)
        .all();
      return new Response(JSON.stringify(results, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // 5. ရှာမတွေ့သော Route များအတွက် 404 ပြန်ပေးခြင်း
    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    // တစ်ခုခု မှားယွင်းခဲ့လျှင် Error ပြပေးခြင်း
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
