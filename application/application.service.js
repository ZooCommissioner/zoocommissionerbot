import {ApplicationModel} from "./application.schema.js";

export class ApplicationService {

  async create(telegramId, username, phoneNumber, name, date, text) {
    return ApplicationModel.create({ telegramId, username, phoneNumber, name, date, text });
  }

  async findAllByTelegramId(telegramId) {
    return ApplicationModel.find({ telegramId })
  }
}
