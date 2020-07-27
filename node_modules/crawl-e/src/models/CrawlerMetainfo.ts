
/**
 * Metainfo about the crawling script etc. which is included in each output file.
 * @category Model
 */
export interface BaseCrawlerMetainfo {
  /** identifier of the crawling script */
  id: string
  'crawl-e'?: {
    /** the version of the Crawl-E framework */
    version: string
  }  
  [key: string]: any
}


export interface CinemaShowtimesCrawlerMetainfo extends BaseCrawlerMetainfo {
  is_booking_link_capable: boolean
  /** A list of Jira issue keys which the crawler has been worked on. */
  jira_issues?: string[]
}