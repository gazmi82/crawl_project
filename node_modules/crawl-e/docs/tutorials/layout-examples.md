# Layout Examples

On this page you find a number of different layouts for showtimes pages along with how the config should be structured for each of the layouts.

<div class="container-fluid">
  <!-- 1 -->
  <!-- showtimes → movies → showtimes -->
  <h2>showtimes → movies → showtimes</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
      <div class="lx">
        <div class="movie">
          <div class="row">
            <div class="col-3">
            <img src="/tutorials/scary_movie.jpg" alt="Scary Movie" width="100" style="padding: 0"/>
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <div class="showtimes">
                <a href="#" class="showtime">18:15</a>
              </div>
              <div class="showtimes">
                <a href="#" class="showtime">20:15</a>
              </div>
            </div>
          </div>
        </div>
        <div class="movie">
          <div class="row">
            <div class="col-3">
            <img src="/tutorials/scary_movie.jpg" alt="Scary Movie" width="100" style="padding: 0"/>
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <div class="showtimes">
                <a href="#" class="showtime">18:15</a>
              </div>
              <div class="showtimes">
                <a href="#" class="showtime">20:15</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    movies: { // parsing config
      //…
      showtimes: { // parsing config
        //…
      }
    }
  }
}
      </code></pre>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h4>Example Websites</h4>
      <ul style="list-style-type: none;">
        <li><a>https://www.kino-ebensee.at/kinoprogramm.html</a></li>
        <li><a>http://www.hasewend.at/kinoprogramm.php</a></li>
      </ul>
    </div>
  </div>

<hr>
  <!-- 2 -->
  <!-- showtimes → movies → dates → showtimes -->
  <h2>showtimes → movies → dates → showtimes</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
       <div class="lx">
        <div class="movie">
          <div class="row">
            <div class="col-3">
            ![Scary Movie](scary_movie.jpg "Scary Movie")
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <div class="date">
                <div class="date">01.06.2018</div>
                <div class="showtimes">
                  <a href="#" class="showtime">18:15</a>
                </div>
                <div class="showtimes">
                  <a href="#" class="showtime">18:15</a>
                </div>
              </div>
              <div class="date">
                <div class="date">01.06.2018</div>
                <div class="showtimes">
                  <a href="#" class="showtime">18:15</a>
                </div>
                <div class="showtimes">
                  <a href="#" class="showtime">18:15</a>
                </div>
              </div>
            </div>
          </div>
        </div>
       </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    movies: { // parsing config
      //…
      dates: { // parsing config
        //…
        showtimes: { // parsing config
          //…
        }
      }
    }
  }
}  
      </code></pre>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h4>Example Websites</h4>
      <ul style="list-style-type: none;">
        <li><a href="http://www.kino-hainfeld.at/programm.php">http://www.kino-hainfeld.at/programm.php</a></li>
        <li><a href="http://www.kino-hartberg.at/dll/cine4you.dll?mode=programm">http://www.kino-hartberg.at/dll/cine4you.dll?mode=programm</a></li>
        <li><a href="http://holzlandkino.de/programm.htm">http://holzlandkino.de/programm.htm</a></li>
      </ul>
    </div>
  </div>

<hr>
  <!-- 3 -->
  <!-- showtimes → dates → movies → showtimes -->
  <h2>showtimes → dates → movies → showtimes</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
       <div class="lx">
        <div class="date">
          <div class="date">01.06.2018</div>
          <div class="row movie">
            <div class="col-3">
            ![Scary Movie](scary_movie.jpg "Scary Movie")
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <div class="showtimes">
                <a href="#" class="showtime">18:15</a>
              </div>
              <div class="showtimes">
                <a href="#" class="showtime">20:15</a>
              </div>
            </div>
          </div>
        </div>
        <div class="date">
          <div class="date">01.07.2018</div>
          <div class="row movie">
            <div class="col-3">
            ![Scary Movie](scary_movie.jpg "Scary Movie")
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <div class="showtimes">
                <a href="#" class="showtime">18:15</a>
              </div>
            </div>
          </div>
        </div>
       </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    dates: { // parsing config
      //…
      movies: { // parsing config
        //…
        showtimes: { // parsing config
          //…
        }
      }
    }
  }
}
      </code></pre>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h4>Example Websites</h4>
      <a href="http://www.gardenacinema.com/showtimes">http://www.gardenacinema.com/showtimes</a>
    </div>
  </div>

<hr>

  <!-- 4 -->
  <!-- showtimes → movies → dates → auditoria → showtimes -->
  <h2>showtimes → movies → dates → auditoria → showtimes</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
      <div class="lx">
        <div class="movie">
          <div class="row">
            <div class="col-3">
            ![Scary Movie](scary_movie.jpg "Scary Movie")
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <div class="date">
                <div class="date">01.06.2018</div>
                <div class="auditorium">
                  <div class="auditorium">Cinema 1</div>
                  <div class="showtimes">
                      <a href="#" class="showtime">18:15</a>
                    </div>
                    <div class="showtimes">
                      <a href="#" class="showtime">18:15</a>
                    </div>
                </div>
                <div class="auditorium">
                  <div class="auditorium">Cinema 2</div>
                  <div class="showtimes">
                      <a href="#" class="showtime">18:15</a>
                    </div>
                    <div class="showtimes">
                      <a href="#" class="showtime">18:15</a>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    movies: { // parsing config
      //…
      dates: { // parsing config
        //…
        auditoria: { // parsing config
          //…
          showtimes: { // parsing config
            //…
          }
        }
      }
    }
  }
}
      </code></pre>
    </div>
  </div>

<hr>

  <!-- 5 -->
  <!-- showtimes → movies → dates → versions → showtimes -->
  <h2>showtimes → movies → dates → versions → showtimes</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
      <div class="lx">
        <div class="movie">
          <div class="row">
            <div class="col-3">
            ![Scary Movie](scary_movie.jpg "Scary Movie")
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <div class="date">
                <div class="date">01.06.2018</div>
                <div class="version">
                  <div class="version">2D</div>
                  <div class="showtimes">
                    <a href="#" class="showtime">18:15</a>
                  </div>
                  <div class="showtimes">
                    <a href="#" class="showtime">20:15</a>
                  </div>
                </div>
                <div class="version">
                  <div class="version">3D</div>
                  <div class="showtimes">
                    <a href="#" class="showtime">14:15</a>
                  </div>
                  <div class="showtimes">
                    <a href="#" class="showtime">17:15</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    movies: { // parsing config
      //…
      dates: { // parsing config
        //…
        versions: { // parsing config
          //…
          showtimes: { // parsing config
            //…
          }
        }
      }
    }
  }
}
      </code></pre>
    </div>
  </div>

  <hr>

  <!-- 6 -->
  <!-- showtimes → movies → table → showtimes → 1 -->
  <h2>showtimes → movies → table → showtimes → 1</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
      <div class="lx">
        <div class="movie">
          <div class="row">
            <div class="col-3">
            ![Scary Movie](scary_movie.jpg "Scary Movie")
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <table>
                <tr>
                  <th class="day">Monday</th>
                  <th class="day">Tuesday</th>
                  <th class="day">Wednesday</th>
                </tr>
                <tr>
                  <td class="time">13:30</td>
                  <td class="time">15:30</td>
                  <td class="time">16:30</td>
                </tr>
                <tr>
                  <td class="time">18:30</td>
                  <td class="time">17:30</td>
                  <td class="time">18:30</td>
                </tr>
                <tr>
                  <td class="time">20:30</td>
                  <td class="time">21:30</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
        <div class="movie">
          <div class="row">
            <div class="col-3">
            ![Scary Movie](scary_movie.jpg "Scary Movie")
            </div>
            <div class="col-9">
              <h3 class="movie-title">Scary Movie</h3>
              <table>
                <tr>
                  <th class="day">Monday</th>
                  <th class="day">Tuesday</th>
                  <th class="day">Wednesday</th>
                </tr>
                <tr>
                  <td class="time">13:30</td>
                  <td class="time">15:30</td>
                  <td class="time">16:30</td>
                </tr>
                <tr>
                  <td class="time">18:30</td>
                  <td class="time">17:30</td>
                  <td class="time">18:30</td>
                </tr>
                <tr>
                  <td class="time">20:30</td>
                  <td class="time">21:30</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    movies: { // parsing config
      //…
      table: { 
        //…
        headerRow: {
          date: {
            //…
          }
        },
        cells: {
          showtimes: { // parsing config
            //…
          }
        }
      }
    }
  }
}
      </code></pre>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h4>Example Websites</h4>
      <ul style="list-style-type: none;">
        <li><a>http://www.atcinemas.com.au/</a></li>
        <li><a>http://www.rex-schifferstadt.de/</a></li>
        <li><a>http://www.cinecenter.at/programm</a></li>
      </ul>
    </div>
  </div>

<hr>

  <!-- 7 -->
  <!-- showtimes → movies → table → showtimes → 2 -->
  <h2>showtimes → movies → table → showtimes → 2</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
      <div class="lx">
        <table style="padding: 0">
          <tbody>
            <tr>
              <th></th>
              <th></th>
              <th class="day">Monday</th>
              <th class="day">Tuesday</th>
              <th class="day">Wednesday</th>
            </tr>
            <tr>
              <td><img src="/tutorials/scary_movie.jpg" alt="Scary Movie" width="100" style="padding: 0"/></td>
              <td class="movie-title">Scary Movie</td>
              <td class="showtimes">
                <ul>
                  <li class="time">17:30</li>
                  <li class="time">19:30</li>
                  <li class="time">21:30</li>
                </ul>
              </td>
              <td class="showtimes">
                <ul>
                  <li class="time">15:30</li>
                  <li class="time">16:30</li>
                  <li class="time">22:30</li>
                </ul>
              </td>
              <td class="showtimes">
                <ul>
                  <li class="time">12:30</li>
                  <li class="time">13:30</li>
                  <li class="time">18:30</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
         <table style="padding: 0">
          <tbody>
            <tr>
              <th></th>
              <th></th>
              <th class="day">Monday</th>
              <th class="day">Tuesday</th>
              <th class="day">Wednesday</th>
            </tr>
            <tr>
              <td><img src="/tutorials/scary_movie.jpg" alt="Scary Movie" width="100" style="padding: 0"/></td>
              <td class="movie-title">Scary Movie</td>
              <td class="showtimes">
                <ul>
                  <li class="time">17:30</li>
                  <li class="time">19:30</li>
                  <li class="time">21:30</li>
                </ul>
              </td>
              <td class="showtimes">
                <ul>
                  <li class="time">15:30</li>
                  <li class="time">16:30</li>
                  <li class="time">22:30</li>
                </ul>
              </td>
              <td class="showtimes">
                <ul>
                  <li class="time">12:30</li>
                  <li class="time">13:30</li>
                  <li class="time">18:30</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    table: {
      //…
      headerRow: {
        date: {
          //…
        }
      },
      headerColumn: {
        movie: {
          //…
        }
      },       
      cells: {
        showtimes: { // parsing config
          //…
        }
      }
    }
  }
}
      </code></pre>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h4>Example Websites</h4>
      <ul style="list-style-type: none;">
        <li><a>http://www.kinobruck.at/Filmprogramm.htm</a></li>
        <li><a>http://www.echucaparamount.com/session-times</a></li>
      </ul>
    </div>
  </div>

<hr>

  <!-- 8 -->
  <!-- showtimes → showtimes -->
  <h2>showtimes → showtimes</h2>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
      <div class="lx">
        <div class="row">
          <div class="showtimes">
            <ul style="list-style-type: none;">
              <li><strong class="date">01.06.2018</strong> </li>
              <li><span class="time">20:15</span> </li>
              <li><span class="movie-title">Scary Foovie 2</span></li>
            </ul>
          </div>
          <div class="showtimes">
            <ul style="list-style-type: none;">
              <li><strong class="date">01.06.2018</strong> </li>
              <li><span class="time">20:15</span> </li>
              <li><span class="movie-title">Scary Foovie 2</span></li>
            </ul>
          </div>
          <div class="showtimes">
            <ul style="list-style-type: none;">
              <li><strong class="date">01.06.2018</strong> </li>
              <li><span class="time">20:15</span> </li>
              <li><span class="movie-title">Scary Foovie 2</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: { // crawling config
    //…
    showtimes: { // parsing config
      //…
      // Scary Movie: 'a' // using extra value grabber
    }
  }
}
      </code></pre>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h4>Example Websites</h4>
      <ul style="list-style-type: none;">
        <li><a>http://www.kintopp-online.de/</a></li>
        <li><a>https://autokino-berlin.de/index.php/programm</a></li>
        <li><a>https://www.lichtkino.de/program_classic.php</a></li>
      </ul>
    </div>
  </div>


<hr>

  <!-- 9 -->
  <!-- showtimes → showtimes with custom value grabbing -->
  <h2>showtimes → showtimes with custom value grabbing</h2>
  <p>This is a speacial case where the website is not structured in a clean nested way. As you can see on the graphic, the date is listed at the same level as showtimes boxes. So at a first glance this seems not possible to parse with the framework, however thanks to <a href="#/advanced/custom-value-grabbing">custom value grabbing</a> it is. It let's you reach outside of a current box as you can see in the config snipped.</p>
  <div class="row">
    <div class="col-7">
      <h3>Layout Graphic</h3>
      <div class="lx">
        <div class="row">
          <div class="date" style="margin: 0px 0px 16px">
            <strong>01.06.2018</strong>
          </div>
          <table class="showtimes">
            <tr>
              <td class="time">20:15</td> 
              <td class="movie-title">Scary Foovie 2</td> 
            </tr>
          </table>
          <table class="showtimes"  >
            <tr>
              <td class="time">20:15</td> 
              <td class="movie-title">Scary Foovie 2</td> 
            </tr>
          </table>
          <table class="showtimes"  >
            <tr>
              <td class="time">20:15</td> 
              <td class="movie-title">Scary Foovie 2</td> 
            </tr>
          </table>
          <table class="showtimes"  >
            <tr>
              <td class="time">20:15</td> 
              <td class="movie-title">Scary Foovie 2</td> 
            </tr>
          </table>
          <table class="showtimes"  >
            <tr>
              <td class="time">20:15</td> 
              <td class="movie-title">Scary Foovie 2</td> 
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="col-5">
      <h3>Config Layout</h3>
      <pre><code class="language-javascript" >
let config = {
  //…
  showtimes: {
  //…
    showtimes: {
      box: 'td:has(a)',
      date: box => box.prevAll('td:has(strong)').first().text()
      //…
    }
  }
}
      </code></pre>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h4>Example Websites</h4>
      <ul style="list-style-type: none;">
        <li><a>https://www.kinopassage-erlenbach.de/die-kino-oase/programm/</a></li>
      </ul>
    </div>
  </div>

</div>

<script>
new Vue({
  el: '#main',
  data: {
    examples: examples
  },

})

Prism.highlightAll()
</script>
