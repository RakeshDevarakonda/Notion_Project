import mongoose from "mongoose";

const tenantUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    invites: {
      type: [
        {
          tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
          status: {
            type: String,
            enum: ["Pending", "Accepted", "Rejected"],
            default: "Pending",
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("TenantUser", tenantUserSchema);
