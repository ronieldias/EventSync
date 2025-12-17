import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EventSync API",
      version: "1.0.0",
      description: "API para gerenciamento de eventos acadêmicos",
    },
    servers: [
      {
        url: "http://localhost:3333/api",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // Auth
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 3, example: "João Silva" },
            email: { type: "string", format: "email", example: "joao@email.com" },
            password: { type: "string", minLength: 6, example: "123456" },
            role: { type: "string", enum: ["organizer", "participant"], default: "participant" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "joao@email.com" },
            password: { type: "string", example: "123456" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
            token: { type: "string" },
          },
        },

        // User
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["organizer", "participant"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UpdateUserInput: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 6 },
          },
        },

        // Event
        Event: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string", enum: ["palestra", "seminario", "mesa_redonda", "oficina", "workshop", "conferencia", "outro", "sem_categoria"] },
            banner: { type: "string", nullable: true },
            date: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time", nullable: true },
            location: { type: "string" },
            workload: { type: "integer" },
            capacity: { type: "integer" },
            status: { type: "string", enum: ["draft", "published", "in_progress", "finished", "cancelled"] },
            subscriptionsOpen: { type: "boolean" },
            organizerId: { type: "string", format: "uuid" },
            organizer: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateEventInput: {
          type: "object",
          required: ["title", "description", "date", "location", "capacity"],
          properties: {
            title: { type: "string", minLength: 3, example: "Workshop de TypeScript" },
            description: { type: "string", minLength: 10, example: "Aprenda TypeScript do zero ao avançado" },
            category: { type: "string", enum: ["palestra", "seminario", "mesa_redonda", "oficina", "workshop", "conferencia", "outro", "sem_categoria"], default: "sem_categoria" },
            banner: { type: "string", example: "https://exemplo.com/banner.jpg" },
            date: { type: "string", format: "date-time", example: "2025-02-15T09:00:00.000Z" },
            endDate: { type: "string", format: "date-time", example: "2025-02-15T17:00:00.000Z" },
            location: { type: "string", minLength: 3, example: "Auditório Central - IFPI" },
            workload: { type: "integer", minimum: 0, default: 0, example: 8 },
            capacity: { type: "integer", minimum: 1, example: 50 },
          },
        },
        UpdateEventInput: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 3 },
            description: { type: "string", minLength: 10 },
            category: { type: "string", enum: ["palestra", "seminario", "mesa_redonda", "oficina", "workshop", "conferencia", "outro", "sem_categoria"] },
            banner: { type: "string" },
            date: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            location: { type: "string", minLength: 3 },
            workload: { type: "integer", minimum: 0 },
            capacity: { type: "integer", minimum: 1 },
          },
        },
        ChangeStatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["draft", "published", "in_progress", "finished", "cancelled"] },
          },
        },
        ToggleSubscriptionsInput: {
          type: "object",
          required: ["open"],
          properties: {
            open: { type: "boolean" },
          },
        },
        RemoveSubscriberInput: {
          type: "object",
          required: ["reason"],
          properties: {
            reason: { type: "string", minLength: 5, example: "Motivo da remoção do participante" },
          },
        },

        // Subscriber
        Subscriber: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            subscribedAt: { type: "string", format: "date-time" },
          },
        },

        // Subscription
        Subscription: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            eventId: { type: "string", format: "uuid" },
            event: { $ref: "#/components/schemas/Event" },
            subscribedAt: { type: "string", format: "date-time" },
          },
        },

        // Notification
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            eventId: { type: "string", format: "uuid", nullable: true },
            title: { type: "string" },
            message: { type: "string" },
            type: { type: "string", enum: ["general", "event_message", "removal", "event_update"] },
            isRead: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        SendNotificationInput: {
          type: "object",
          required: ["title", "message"],
          properties: {
            title: { type: "string", minLength: 3, example: "Lembrete Importante" },
            message: { type: "string", minLength: 10, example: "Não esqueça de trazer seu notebook para o workshop!" },
          },
        },
        UnreadCountResponse: {
          type: "object",
          properties: {
            count: { type: "integer", example: 5 },
          },
        },

        // Error
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/infrastructure/http/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
