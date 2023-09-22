import * as mongoose from "mongoose";

const schema = new mongoose.Schema({
  telegramId: { type: Number, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  date: { type: Date, required: true },
  text: { type: String, required: true },
});

export const ApplicationModel = mongoose.model('Application', schema);
