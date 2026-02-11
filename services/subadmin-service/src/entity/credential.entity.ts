import { Schema, model, Types } from "mongoose";



const SubAdminCredentialSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },

    subAdmin: {
      type: Types.ObjectId,
      ref: "SubAdmin",
      required: true,
      unique: true, // one-to-one relation
    },
  },
  { timestamps: true }
);

export const SubAdminCredential = model(
  "SubAdminCredential",
  SubAdminCredentialSchema
);
