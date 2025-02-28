import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  permissions: mongoose.Types.ObjectId[];
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }]
});

export default mongoose.model<IRole>("Role", RoleSchema);
