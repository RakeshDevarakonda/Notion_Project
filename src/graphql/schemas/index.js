import { databaseMutation } from "./mutations/databaseMutation.js";
import { fieldsAndValuesMutation } from "./mutations/fieldsAndValuesMutation.js";
import { rowsMutation } from "./mutations/rowsMutation.js";
import { databaseQueries } from "./queries/databaseQueries.js";
import { fieldAndValueQueries } from "./queries/fieldAndValueQueries.js";
import { filterQueries } from "./queries/filtersQueries.js";
import { rowQueries } from "./queries/rowQueries.js";

export const typeDefs = [
  databaseMutation,
  fieldsAndValuesMutation,
  rowsMutation,
  databaseQueries,
  fieldAndValueQueries,
  rowQueries,
  filterQueries,
];
