export const animeDetailHtmlFixture = `
<!doctype html>
<html><body>
  <p class="AnmStts"><span>En emisión</span></p>
  <div class="Description"><p>Una historia épica de titanes y libertad.</p></div>
  <nav class="Nvgnrs">
    <a href="/genre/action">Acción</a>
    <a href="/genre/drama">Drama</a>
  </nav>
  <script>
    var anime_info = ["1234","shingeki-no-kyojin","Shingeki no Kyojin","1"];
    var episodes = [[3,"5555"],[1,"5553"],[2,"5554"]];
  </script>
</body></html>`;

export const animeDetailFinishedHtmlFixture = `
<!doctype html>
<html><body>
  <p class="AnmStts"><span>Finalizado</span></p>
  <div class="Description"><p>Serie ya emitida.</p></div>
  <nav class="Nvgnrs"><a>Comedia</a></nav>
  <script>
    var anime_info = ["42","kimetsu-no-yaiba","Kimetsu","1"];
    var episodes = [[1,"1"]];
  </script>
</body></html>`;
