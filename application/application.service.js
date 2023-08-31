import {ApplicationModel} from "./application.schema.js";

export class ApplicationService {

  async create(telegramId, name, date, text) {
    return ApplicationModel.create({ telegramId, name, date, text });
  }

  async findAllByTelegramId(telegramId) {
    return ApplicationModel.find({ telegramId })
  }
}
