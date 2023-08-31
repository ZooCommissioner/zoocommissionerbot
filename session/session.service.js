import {SessionModel} from "./session.schema.js";

export class SessionService {

  async create(telegramId, name) {
    return SessionModel.create({ telegramId, name });
  }

  async findByTelegramId(telegramId) {
    return SessionModel.findOne({ telegramId });
  }

  async deleteByTelegramId(telegramId) {
    return SessionModel.deleteOne({ telegramId });
  }
}
