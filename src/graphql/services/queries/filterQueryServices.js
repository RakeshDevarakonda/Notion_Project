import mongoose from "mongoose";
import dayjs from "dayjs";
import { Database, Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";

const isValid = (val) => val !== undefined && val !== null;

export const getFilteredRows = async (input) => {
  const { databaseId, TenantId, filters = [], page = 1, limit = 10 } = input;

  const query = { database: databaseId, Tenant: TenantId };
  const andConditions = [];

  const wrapCond = (cond) => {
    return { values: { $elemMatch: { ...cond } } };
  };

  for (const filter of filters) {
    if (filter.text) {
      const f = filter.text;
      const orCond = [];
      if (isValid(f.equals)) orCond.push({ value: f.equals });
      if (isValid(f.contains))
        orCond.push({ value: { $regex: f.contains, $options: "i" } });
      if (isValid(f.startsWith))
        orCond.push({ value: { $regex: `^${f.startsWith}`, $options: "i" } });
      if (isValid(f.endsWith))
        orCond.push({ value: { $regex: `${f.endsWith}$`, $options: "i" } });
      if (orCond.length) andConditions.push(wrapCond({ $or: orCond }));
      if (isValid(f.notEquals))
        andConditions.push(wrapCond({ value: { $ne: f.notEquals } }));
      if (isValid(f.notContains))
        andConditions.push(
          wrapCond({ value: { $not: new RegExp(f.notContains, "i") } })
        );
    }

    if (filter.number) {
      const f = filter.number;
      const cond = {};
      if (isValid(f.equals)) cond.$eq = f.equals;
      if (isValid(f.notEquals)) cond.$ne = f.notEquals;
      if (isValid(f.gt)) cond.$gt = f.gt;
      if (isValid(f.gte)) cond.$gte = f.gte;
      if (isValid(f.lt)) cond.$lt = f.lt;
      if (isValid(f.lte)) cond.$lte = f.lte;
      if (f.between?.length === 2)
        (cond.$gte = f.between[0]), (cond.$lte = f.between[1]);
      if (Object.keys(cond).length)
        andConditions.push(wrapCond({ value: cond }));
    }

    if (isValid(filter.boolean?.equals)) {
      andConditions.push(wrapCond({ value: filter.boolean.equals }));
    }

    if (filter.select) {
      const f = filter.select;
      if (isValid(f.equals)) andConditions.push(wrapCond({ value: f.equals }));
      if (isValid(f.notEquals))
        andConditions.push(wrapCond({ value: { $ne: f.notEquals } }));
    }

    if (filter.multiSelect) {
      const f = filter.multiSelect;
      if (f.contains?.length)
        andConditions.push(wrapCond({ value: { $in: f.contains } }));
      if (f.notContains?.length)
        andConditions.push(wrapCond({ value: { $nin: f.notContains } }));
      if (f.containsAll?.length) {
        andConditions.push({
          values: {
            $all: f.containsAll.map((v) => ({
              $elemMatch: { value: v },
            })),
          },
        });
      }
    }

    if (filter.relation) {
      const f = filter.relation;

      if (!mongoose.Types.ObjectId.isValid(f.equals)) {
        throwUserInputError(`Invalid ObjectId: ${f.equals}`);
      }

      if (isValid(f.equals)) {
        const exists = await Database.exists({
          _id: new mongoose.Types.ObjectId(f.equals),
        });
        if (!exists)
          throwUserInputError(`Relation ID ${f.equals} not found in DB`);

        andConditions.push(
          wrapCond({ value: new mongoose.Types.ObjectId(f.equals) })
        );
      }

      if (isValid(f.notEquals)) {
        const exists = await Database.exists({
          _id: new mongoose.Types.ObjectId(f.equals),
        });
        if (!exists)
          throwUserInputError(`Relation ID ${f.notEquals} not found in DB`);

        andConditions.push(
          wrapCond({
            value: { $ne: new mongoose.Types.ObjectId(f.notEquals) },
          })
        );
      }
    }

    if (filter.date) {
      const f = filter.date;
      const cond = {};
      const today = dayjs().startOf("day");
      if (isValid(f.equals)) cond.$eq = new Date(f.equals);
      if (isValid(f.notEquals)) cond.$ne = new Date(f.notEquals);
      if (isValid(f.before)) cond.$lt = new Date(f.before);
      if (isValid(f.after)) cond.$gt = new Date(f.after);
      if (f.between?.length === 2)
        (cond.$gte = new Date(f.between[0])),
          (cond.$lte = new Date(f.between[1]));
      if (f.today)
        (cond.$gte = today.toDate()), (cond.$lt = today.add(1, "day").toDate());
      if (f.yesterday)
        (cond.$gte = today.subtract(1, "day").toDate()),
          (cond.$lt = today.toDate());
      if (f.tomorrow)
        (cond.$gte = today.add(1, "day").toDate()),
          (cond.$lt = today.add(2, "day").toDate());
      if (Object.keys(cond).length) andConditions.push(wrapCond(cond));
    }
  }

  if (andConditions.length) query.$and = andConditions;

  console.log(andConditions);

  const skip = (Number(page) - 1) * Number(limit);

  const [rows, totalRows] = await Promise.all([
    Row.find(query).skip(skip).limit(Number(limit)).lean(),
    Row.countDocuments(query),
  ]);

  return { rows, page: Number(page), limit: Number(limit), totalRows };
};
