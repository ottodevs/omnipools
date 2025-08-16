export async function GET() {
  return new Response(
    JSON.stringify({ 
      ok: true, 
      ts: Date.now(),
      version: '0.2.0',
      status: 'healthy'
    }), 
    { 
      headers: { "content-type": "application/json" }
    }
  );
} 