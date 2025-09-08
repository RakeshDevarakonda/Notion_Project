import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import authRouter from "./src/RestApi/routes/authroutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import tenantRouter from "./src/RestApi/routes/tenantRoutes.js";

import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./src/graphql/resolvers/index.js";
import { typeDefs } from "./src/graphql/schemas/index.js";
import { context } from "./src/middleware/authmiddleware.js";


const app = express();
const PORT = process.env.PORT || 8000;

connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Notion Running"));

app.use("/api/auth", authRouter);

app.use("/api/tenant", tenantRouter);


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
});



await server.start();

server.applyMiddleware({ app, path: "/graphql" });

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `🚀 GraphQL endpoint available at http://localhost:${PORT}/graphql`
  );
});


// https://vscode.dev/profile/github/b2943665c3ca3bb5ef9fee0195d22c48