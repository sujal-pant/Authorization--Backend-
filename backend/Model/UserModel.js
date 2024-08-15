import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    lastlogin: {
      type: Date,
      default: Date.now,
    },
    isverified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,

  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;

