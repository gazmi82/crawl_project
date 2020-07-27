import Config from '../../../src/Config'

export const kinoGmundenAtConfig = new Config({
  showtimes: {
    urlDateFormat: 'DD-MM-YYYY',
    url: 'http://www.kino-gmunden.at/?page_id=55&dt=:date:&page=-1',
    movies: {
      box: '.overview',
      title: 'h1',
      showtimes: {
        box: '.time',
        datetimeFormat: 'DD-MM-YYYY - HH:mm'
      }
    }
  }
})