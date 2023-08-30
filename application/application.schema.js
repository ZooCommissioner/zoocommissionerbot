import * as mongoose from "mongoose";

const schema = new mongoose.Schema({
  telegramId: { type: Number, required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
});

export const ApplicationModel = mongoose.model('Application', schema);
