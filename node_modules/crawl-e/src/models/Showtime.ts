/**
 * @category Model
 */
export interface Showtime {
  /** the localized title of the show’s movie if available, the movie will be matched with existing cinepass movies */
  movie_title?: string

  /** the original title of the show’s movie, the movie be matched with this title in case matching via movie_title faile */
  movie_title_original?: string 

  /** the IMDB ID of the movie. Will be used to identify the movie. If set, still provide the movie_title as a fallback! */
  movie_imdb_id?: string

  /** the date and time when the show begins given in a parseable format, e.g. ISO8601 */
  start_at?: string

  /** the date and time when the show is planened to end given in a parseable format, e.g. ISO8601 */
  end_at?: string

  /** the spoken language the movies is shown in  as ISO 639 code or `original version` if the show is marked as VO/OV without reference to the original language." */
  language?: string

  /** the subtitle language(s) if there are any  as ISO 639 code or comma separated list set to `undetermined` if it is save to know there are subtitles but not in which language" */
  subtitles?: string

  /** if the show is in 3D */
  is_3d?: boolean

  /** if the show is in IMAX */
  is_imax?: boolean

  /** the cinema’s room the show is presented in */
  auditorium?: string

  /** URL a deeplink to the cinema’s */
  booking_link?: string
}
