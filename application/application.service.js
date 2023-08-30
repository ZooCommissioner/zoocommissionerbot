export class ApplicationService {

  pasteApplication(telegramId, name, date, text) {
    console.log('record', { telegramId, name, date: date.toLocaleString(), text })
  }
}
