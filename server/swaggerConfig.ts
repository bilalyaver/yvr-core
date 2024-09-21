import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { OpenAPIV3 } from 'openapi-types';
import fs from 'fs';
import path from 'path';
import settingLoader from './settingLoader';
import loadAllSchemas from './loadAllSchemas';

const { swagger } = settingLoader();

// Kendi arayüzlerinizi kullanın
interface MyComponentsObject extends OpenAPIV3.ComponentsObject {
  schemas: { [key: string]: OpenAPIV3.SchemaObject };
}

interface MyOpenAPIV3Document extends OpenAPIV3.Document {
  components: MyComponentsObject;
}

// 'definition' nesnesini tanımlayın
const definition: MyOpenAPIV3Document = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
  },
  paths: {},
  components: {
    schemas: {},
  },
};

// Swagger'a uygun tipler için bir eşleştirme fonksiyonu
const mapTypeToSwaggerType = (type: string): string => {
  switch (type) {
    case 'String':
    case 'RichText':
    case 'Media':
    case 'Slug':
    case 'ObjectId':
      return 'string'; // Bu türler Swagger'da genellikle string olarak temsil edilir
    case 'Boolean':
      return 'boolean';
    default:
      return 'string'; // Varsayılan olarak string kabul edilir
  }
};

// Schema dosyalarını oku ve swagger şema yapısına dönüştür
const schemaFiles = loadAllSchemas();

schemaFiles.forEach((file: string) => {
  const schemaPath = path.resolve(`src/schemas/${file}`);
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaContent);
  const modelName = schema.model.name;

  // Swagger şeması için 'properties' oluşturma
  const properties: Record<string, OpenAPIV3.SchemaObject> = {};
  const requiredFields: string[] = []; // Zorunlu alanlar için ayrı bir liste

  schema.fields.forEach((field: any) => {
    properties[field.name] = {
      type: mapTypeToSwaggerType(field.type),
      description: field.name,
      default: field.defaultValue || undefined,
    } as OpenAPIV3.SchemaObject;

    // Eğer 'required' ise required listesine ekliyoruz
    if (field.required) {
      requiredFields.push(field.name);
    }
  });

  // Model şeması oluştur
  definition.components.schemas[modelName] = {
    type: 'object',
    properties,
    required: requiredFields.length ? requiredFields : undefined, // Eğer required alanlar varsa ekle
  } as OpenAPIV3.SchemaObject;

  // Path'leri oluştur. Özel rota yapısına göre: api/{modelName}:{action}
  definition.paths[`/api/${modelName.toLowerCase()}:getAll`] = {
    get: {
      tags: [modelName],
      summary: `Get all ${modelName}s`,
      responses: {
        '200': {
          description: `A list of ${modelName}s`,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: `#/components/schemas/${modelName}` },
              },
            },
          },
        },
      },
    },
  } as OpenAPIV3.PathItemObject;

  definition.paths[`/api/${modelName.toLowerCase()}:get`] = {
    get: {
      tags: [modelName],
      summary: `Get a single ${modelName}`,
      parameters: [
        {
          in: 'query',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
          description: `ID of the ${modelName} to retrieve`,
        },
      ],
      responses: {
        '200': {
          description: `A single ${modelName}`,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${modelName}` },
            },
          },
        },
      },
    },
  } as OpenAPIV3.PathItemObject;

  definition.paths[`/api/${modelName.toLowerCase()}:create`] = {
    post: {
      tags: [modelName],
      summary: `Create a new ${modelName}`,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${modelName}` },
          },
        },
      },
      responses: {
        '201': { description: `${modelName} created` },
      },
    },
  } as OpenAPIV3.PathItemObject;

  definition.paths[`/api/${modelName.toLowerCase()}:update`] = {
    put: {
      tags: [modelName],
      summary: `Update a ${modelName}`,
      parameters: [
        {
          in: 'query',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
          description: `ID of the ${modelName} to update`,
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${modelName}` },
          },
        },
      },
      responses: {
        '200': { description: `${modelName} updated` },
      },
    },
  } as OpenAPIV3.PathItemObject;

  definition.paths[`/api/${modelName.toLowerCase()}:delete`] = {
    delete: {
      tags: [modelName],
      summary: `Delete a ${modelName}`,
      parameters: [
        {
          in: 'query',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
          description: `ID of the ${modelName} to delete`,
        },
      ],
      responses: {
        '200': { description: `${modelName} deleted` },
      },
    },
  } as OpenAPIV3.PathItemObject;
});

// Swagger seçeneklerini oluştur
const swaggerOptions: Options = {
  definition,
  apis: [],
};

// Swagger dokümanını oluştur
const swaggerDocs = swaggerJsdoc(swaggerOptions);

export default swaggerDocs;