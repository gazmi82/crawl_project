const CrawlE = require('crawl-e')


let crawlE = new CrawlE({
	cinemas: [
    {
      name: 'Kino Gmunden',
      address: 'Theatergasse 7, 4810 Gmunden',
      website: 'http://www.kino-gmunden.at/',
      phone: '0676 / 88 794 505'
    }
  ],

  showtimes: {
    url: 'http://www.kino-gmunden.at/?page_id=55&dt=:date:&page=-1',
    urlDateFormat: 'DD-MM-YYYY',

    movies: {
      box: '.overview',
      title: 'h1',

      showtimes: {
        box: '.time',
        datetimeFormat: 'DD-MM-YYYY - HH:mm'
      }
    }
  }
});

crawlE.crawl()