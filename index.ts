import fastify from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { JSONSchema } from 'json-schema-to-ts'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'

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

const server = fastify()
  .withTypeProvider<JsonSchemaToTsProvider<{ references: [typeof $parent, typeof $child] }>>()
  .addSchema($parent)
  .addSchema($child)

await server
  .register(fastifySwagger)
  .register(fastifySwaggerUi)

server
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


server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})