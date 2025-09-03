import { Database } from "../../models/Database.js";

export const databaseResolver = {
  mydetails: async (_) => {
    return {
      name: "John Doe",
      email: "john@example.com",
    };
  },
  Mutation: {
    createDatabaseWithRows: async (_, { input }) => {
      try {
        const { tenantId, name, rows } = input;

        console.log(rows)

        const formattedRows = rows.map((row) => ({
          rowNumber: row.rowNumber,
          data: row.fields.map((field) => ({
            field: {
              fieldName: field.fieldName,
              fieldType: field.fieldType,
            },
            value: {
              value: field.value,
            },
          })),
        }));

        const database = new Database({
          tenantId,
          name,
          rows: formattedRows,
        });

        await database.save();

        return database;
      } catch (error) {
        console.error("Error creating database:", error);
        throw new Error("Failed to create database");
      }
    },
  },
};
