export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Endpoint 1: ဝတ္ထုအားလုံးစာရင်း တောင်းခြင်း (/api/novels)
    if (url.pathname === '/api/novels') {
      const { results } = await env.DB.prepare('SELECT * FROM novels').all();
      return Response.json(results, {
        headers: { 'Access-Control-Allow-Origin': '*' } // Frontend က လှမ်းခေါ်လို့ရအောင်
      });
    }

    // Endpoint 2: အခန်းအလိုက် စာသားတောင်းခြင်း (/api/chapter?novel=martial-peak&num=1)
    if (url.pathname === '/api/chapter') {
      const novelId = url.searchParams.get('novel');
      const chNum = url.searchParams.get('num');

      const chapter = await env.DB.prepare(
        'SELECT * FROM chapters WHERE novel_id = ? AND chapter_number = ?'
      ).bind(novelId, chNum).first();

      return Response.json(chapter, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response("Webnovel API Running. Try /api/novels", { status: 200 });
  },
};
