import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TenantUser",
      required: true,
    },

    members: [
      {
        tenantUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TenantUser",
          required: true,
        },
        email: {
          type: String,
          required: true,
        },

        isActive: {
          type: Boolean,
          default: true,
        },

        role: {
          type: String,
          enum: ["Admin", "Viewer", "Editor"],
          default: "Viewer",
        },

        //  _id: false
      },
    ],


    
    invites: {
      type: [
        {
          tenantUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TenantUser",
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

export default mongoose.model("Tenant", tenantSchema);
