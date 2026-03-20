import { createClient } from '@/lib/supabase/server'
import type { FormField } from '@/lib/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderField(field: FormField): string {
  const label = escapeHtml(field.label)
  const requiredAttr = field.required ? ' required' : ''
  const requiredStar = field.required ? ' <span style="color:red">*</span>' : ''
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : ''

  switch (field.type) {
    case 'textarea':
      return `<div class="field"><label>${label}${requiredStar}</label><textarea name="${escapeHtml(field.id)}" rows="3"${placeholder}${requiredAttr}></textarea></div>`

    case 'select': {
      if (!field.options || field.options.length === 0) {
        return `<div class="field"><label>${label}${requiredStar}</label><select name="${escapeHtml(field.id)}"${requiredAttr}><option value="">${escapeHtml(field.placeholder || 'Select an option')}</option></select></div>`
      }
      const options = field.options.map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('\n')
      return `<div class="field"><label>${label}${requiredStar}</label><select name="${escapeHtml(field.id)}"${requiredAttr}>\n<option value="">Select an option</option>\n${options}\n</select></div>`
    }

    case 'radio': {
      if (!field.options || field.options.length === 0) {
        return `<div class="field"><label>${label}${requiredStar}</label><p>No options defined yet.</p></div>`
      }
      const radios = field.options.map(opt => `<label><input type="radio" name="${escapeHtml(field.id)}" value="${escapeHtml(opt)}"> ${escapeHtml(opt)}</label>`).join('\n')
      return `<div class="field"><label>${label}${requiredStar}</label>\n${radios}\n</div>`
    }

    case 'checkbox': {
      if (field.options && field.options.length > 0) {
        const checkboxes = field.options.map(opt => `<label><input type="checkbox" name="${escapeHtml(field.id)}" value="${escapeHtml(opt)}"> ${escapeHtml(opt)}</label>`).join('\n')
        return `<div class="field"><label>${label}${requiredStar}</label>\n${checkboxes}\n</div>`
      } else {
        return `<div class="field"><label><input type="checkbox" name="${escapeHtml(field.id)}"${requiredAttr}> ${label}${field.required ? ' *' : ''}</label></div>`
      }
    }

    case 'email':
      return `<div class="field"><label>${label}${requiredStar}</label><input type="email" name="${escapeHtml(field.id)}"${placeholder}${requiredAttr}></div>`

    case 'phone':
      return `<div class="field"><label>${label}${requiredStar}</label><input type="tel" name="${escapeHtml(field.id)}"${placeholder}${requiredAttr}></div>`

    case 'number':
      return `<div class="field"><label>${label}${requiredStar}</label><input type="number" name="${escapeHtml(field.id)}"${placeholder}${requiredAttr}></div>`

    case 'date':
      return `<div class="field"><label>${label}${requiredStar}</label><input type="date" name="${escapeHtml(field.id)}"${requiredAttr}></div>`

    case 'text':
    default:
      return `<div class="field"><label>${label}${requiredStar}</label><input type="text" name="${escapeHtml(field.id)}"${placeholder}${requiredAttr}></div>`
  }
}

function generateHtml(form: { id: string; name: string; fields: FormField[] }): string {
  const renderedFields = form.fields.map(renderField).join('\n')
  const formId = escapeHtml(form.id)
  const formName = escapeHtml(form.name)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${formName}</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; color: #111; }
.field { margin-bottom: 20px; }
label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px; }
input, textarea, select { display: block; width: 100%; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; padding: 8px 12px; font-size: 14px; }
button[type=submit] { background: #111; color: #fff; border: none; border-radius: 4px; padding: 10px 20px; font-size: 14px; cursor: pointer; }
.error { color: red; margin-top: 8px; font-size: 14px; }
.success { color: green; font-size: 16px; margin-top: 20px; }
</style>
</head>
<body>
<h1>${formName}</h1>
<form id="the-form">
${renderedFields}
<button type="submit">Submit</button>
</form>
<p id="success-msg" class="success" style="display:none">Thank you! Your response has been recorded.</p>
<p id="error-msg" class="error"></p>
<script>
document.getElementById('the-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {};
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    if (data[key] !== undefined) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  try {
    const res = await fetch('/api/submit/${formId}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.status === 201) {
      form.style.display = 'none';
      document.getElementById('success-msg').style.display = 'block';
    } else {
      const body = await res.json();
      document.getElementById('error-msg').textContent = body.error || 'Submission failed. Please try again.';
    }
  } catch {
    document.getElementById('error-msg').textContent = 'Network error. Please try again.';
  }
});
</script>
</body>
</html>`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('published', true)
    .single()

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Form not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  const html = generateHtml(data)

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html', ...corsHeaders },
  })
}
