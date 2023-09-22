import {SessionModel} from "./session.schema.js";

export class SessionService {

  async create(telegramId, name) {
    return SessionModel.create({ telegramId, name });
  }

  async update(telegramId, session) {
    return SessionModel.updateOne(
      { telegramId },
      { ...session },
      { new: true },
    );
  }

  async findByTelegramId(telegramId) {
    return SessionModel.findOne({ telegramId });
  }

  async deleteByTelegramId(telegramId) {
    return SessionModel.deleteOne({ telegramId });
  }

  isValidPhoneNumber(phoneNumber) {
    return /^[0-9]{10}$/.test(phoneNumber) && Number.parseInt(phoneNumber.substring(0, 1)) === 0;
  }
}
