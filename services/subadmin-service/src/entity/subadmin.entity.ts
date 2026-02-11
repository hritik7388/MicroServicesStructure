import { Schema, model, Types } from "mongoose";
export enum UserType {
  SUB_ADMIN = "SUB ADMIN",
}

export enum SubAdminStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}
const SubAdminSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
    },

    countryCode: {
      type: String,
    },

    userType: {
      type: String,
      enum: ["SUB ADMIN"],
      default: "SUB ADMIN",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
    },

    otpExpireTime: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"],
      default: "ACTIVE",
    },

    address: {
      type: Object,
    },

    coordinates: {
      lat: Number,
      lng: Number,
    },

    credential: {
      type: Types.ObjectId,
      ref: "SubAdminCredential",
    },
  },
  { timestamps: true }
);

export const SubAdmin = model("SubAdmin", SubAdminSchema);
