import { NextRequest } from 'next/server'

const CORS = { 'Access-Control-Allow-Origin': '*' }

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params
  const baseUrl = new URL(request.url).origin

  const js = [
    '(function() {',
    '  var id = "ai-form-' + formId + '";',
    '  var container = document.getElementById(id);',
    '  if (!container) return;',
    '  var iframe = document.createElement("iframe");',
    '  iframe.src = "' + baseUrl + '/embed/' + formId + '";',
    '  iframe.style.cssText = "width:100%;height:600px;border:none;display:block;";',
    '  iframe.setAttribute("frameborder", "0");',
    '  container.appendChild(iframe);',
    '})();',
  ].join('\n')

  return new Response(js, {
    headers: {
      ...CORS,
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
