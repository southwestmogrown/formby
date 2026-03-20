import { describe, it, expectTypeOf } from 'vitest'
import type { FieldType, FormField, Form, Submission, GenerateRequest, GenerateResponse, DemoSession } from '../types'

describe('types', () => {
  it('FieldType covers all supported input types', () => {
    const types: FieldType[] = [
      'text', 'email', 'phone', 'textarea',
      'select', 'checkbox', 'radio', 'number', 'date',
    ]
    expectTypeOf(types).toMatchTypeOf<FieldType[]>()
  })

  it('FormField has correct shape', () => {
    const field: FormField = {
      id: 'abc123',
      type: 'text',
      label: 'Name',
      required: true,
    }
    expectTypeOf(field).toMatchTypeOf<FormField>()
  })

  it('Form has webhook_url as string or null', () => {
    expectTypeOf<Form['webhook_url']>().toMatchTypeOf<string | null>()
  })

  it('Submission data allows string, string[], or boolean values', () => {
    const data: Submission['data'] = {
      name: 'Alice',
      tags: ['a', 'b'],
      agreed: true,
    }
    expectTypeOf(data).toMatchTypeOf<Record<string, string | string[] | boolean>>()
  })

  it('GenerateRequest has optional isDemo flag', () => {
    const req: GenerateRequest = { description: 'A contact form' }
    const demoReq: GenerateRequest = { description: 'A contact form', isDemo: true }
    expectTypeOf(req).toMatchTypeOf<GenerateRequest>()
    expectTypeOf(demoReq).toMatchTypeOf<GenerateRequest>()
  })

  it('DemoSession generationsUsed is a number', () => {
    expectTypeOf<DemoSession['generationsUsed']>().toBeNumber()
  })

  it('GenerateResponse has name and fields', () => {
    expectTypeOf<GenerateResponse>().toHaveProperty('name')
    expectTypeOf<GenerateResponse>().toHaveProperty('fields')
  })
})
