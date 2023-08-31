import * as mongoose from "mongoose";

const schema = new mongoose.Schema({
  telegramId: { type: Number, required: true },
  name: { type: String, required: true },
  text: { type: String, required: false },
})

export const SessionModel = mongoose.model('Session', schema)
