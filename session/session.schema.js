import * as mongoose from "mongoose";

const schema = new mongoose.Schema({
  telegramId: { type: Number, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  text: { type: String, required: false },
  hasError: { type: Boolean, required: false },
})

export const SessionModel = mongoose.model('Session', schema)
