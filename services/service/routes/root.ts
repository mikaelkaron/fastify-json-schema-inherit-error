/// <reference path="../global.d.ts" />
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { JSONSchema } from 'json-schema-to-ts'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const $parent = {
    $id: 'schema:parent',
    type: 'object',
    properties: {
      parent: { type: 'string' }
    },
    required: ['parent']
  } as const satisfies JSONSchema
  
  const $child = {
    $id: 'schema:child',
    $ref: 'schema:parent',
    type: 'object',
    properties: {
      child: { type: 'string' },
    },
    required: ['child'],
    unevaluatedProperties: false
  } as const satisfies JSONSchema

  fastify
    .withTypeProvider<JsonSchemaToTsProvider<{ references: [typeof $parent, typeof $child] }>>()
    .addSchema($parent)
    .addSchema($child)
    .route({
      method: 'GET',
      url: '/parent',
      schema: {
        response: {
          200: {
            $ref: 'schema:parent'
          } as const satisfies JSONSchema
        }
      },
      handler: () => ({
        parent: 'parent',
      })
    })
    .route({
      method: 'GET',
      url: '/child',
      schema: {
        response: {
          200: {
            $ref: 'schema:child'
          } as const satisfies JSONSchema
        }
      },
      handler: () => ({
        parent: 'parent',
        child: 'child'
      })
    })
  }
