const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0', // Specify the OpenAPI/Swagger version
    info: {
      title: 'API for Zikr Messenger', // Title of the documentation
      version: '1.0.0', // Version of the API
      description: 'This is a REST API application built with Express. It manages groups, messages, and users for a Quran study and zikr platform.', // Description of the API
      contact: {
        name: 'Tokhirov Hikmatillo', // Optional: Developer or company name
        email: 'tokhirov2005@gmail.com', // Optional: Developer contact
      },
    },
    servers: [
      {
        url: 'http://localhost:2005', // URL of the development server
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional: Specify token format
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Apply bearer auth globally to all operations
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs (your routes)
};

// Initialize Swagger
const swaggerSpec = swaggerJsdoc(options);

// Function to set up Swagger UI and JSON
function setupSwagger(app) {
  // Serve Swagger UI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve the API docs in JSON format at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = setupSwagger;
