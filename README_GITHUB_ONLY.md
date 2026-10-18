# Bandylive – GitHub Pages -testiversio (ilman Verceliä)

Tämä paketti pohjautuu Bandyliven sarjataulukko-grafiikka -pakettiin. Se säilyttää grafiikoiden HTML/CSS-ulkoasun ja lisää `github-only.js`-sovittimen, joka korvaa Vercelin `/api/*`-reitit selaimessa.

## Tärkeä rajoitus

GitHub Pages on staattinen hosting eikä suorita `api/*.js`-palvelinfunktioita. Sovitin yrittää hakea live-tiedot suoraan TorneoPalista selaimella. **Jos TorneoPal ei salli CORS-pyyntöjä, selain estää haun eikä pelkkä GitHub Pages voi kiertää estoa.** Tätä ei voi korjata HTML/JavaScript-koodilla turvallisesti. Tämän työympäristön verkkoyhteys ei mahdollistanut TorneoPalin selaimen CORS-käyttäytymisen oikeaa live-varmistusta, joten testi pitää vahvistaa julkaistulla sivulla.

## Mitä toimii tässä versiossa

- Kaikki mukana olevat grafiikka- ja ohjauspaneelit julkaistaan staattisina tiedostoina.
- `?ottelu=23611`, `?pvm=YYYY-MM-DD`, `?turnaus=sjpl_2627`, `?sarja=MBL`, `?refresh=30` ja grafiikoiden omat parametrit pysyvät käytössä.
- Oletusottelu ja grafiikoiden näkyvyys tallentuvat selaimen `localStorage`-tallennukseen, jos selain sallii sen.
- Tulostaulu, kokoonpanot ja sarjataulukko yrittävät hakea tietonsa suoraan TorneoPalista.
- Vanhoja `/api/*`-kutsuja ei tarvitse muuttaa yksitellen, koska sovitin ohjaa ne suoraan selaimessa.

## Mitä ei voida taata ilman palvelinta

- Oletusottelun ja näkyvyystilojen synkronointi eri laitteiden / erillisten selainten välillä. `localStorage` on paikallinen.
- Kokoonpano- ja sarjataulukko-HTML:n haku, jos TorneoPal estää selaimesta tulevat CORS-pyynnöt.
- Livepäivitysten toiminta, jos TorneoPalin live-endpoint ei salli CORSia.
- Ohjaussalasana ei ole turvallisuusraja tässä versiossa: paikallinen tallennus ei käytä palvelimen salasanasuojausta.

## Julkaisu GitHub Pagesiin

1. Tee varmuuskopio nykyisestä `ripsmooth/bandylive`-repositoriosta.
2. Pura ZIP ja kopioi sen sisältö repositorion julkaistavan juuren tasolle (eli `index.html` tulee juureen, ei alikansioon).
3. Varmista, että `github-only.js`, `testidata.json`, kaikki HTML-sivut ja `api`-kansio ovat samassa juuressa kuin `index.html`. `api`-kansio voi jäädä mukaan, mutta GitHub Pages ei suorita sen JavaScript-tiedostoja.
4. GitHubissa: **Settings → Pages** ja valitse oikea julkaisuhaara/kansio.
5. Avaa ensin `https://ripsmooth.github.io/bandylive/` ja sitten testi-URLit alla.

## Testit julkaisemisen jälkeen

Avaa selaimessa:

- Portaalin etusivu: `https://ripsmooth.github.io/bandylive/`
- Sarjataulukko: `https://ripsmooth.github.io/bandylive/sarjataulukko.html?turnaus=sjpl_2526&sarja=MBL&refresh=30&debug=1`
- Kokoonpano: `https://ripsmooth.github.io/bandylive/kokoonpanot.html?ottelu=23611&debug=1`
- Tulostaulu: `https://ripsmooth.github.io/bandylive/tulostaulu.html?ottelu=23611&debug=1`

Jos sivu ilmoittaa `Failed to fetch` tai selaimen konsolissa lukee `blocked by CORS policy`, suora GitHub-only-haku ei ole mahdollinen kyseiselle TorneoPal-osoitteelle. Silloin täysin Vercel-vapaa vaihtoehto vaatisi toisen tiedonjakotavan, esimerkiksi GitHub Actionsin ajastetusti tuottamat staattiset JSON-tiedostot (päivitys ei ole reaaliaikainen) tai muun palvelinpuolen välityksen.

## Testit tässä paketissa

- Tarkistettu, että kaikissa HTML-sivuissa sovitin ladataan ennen sovelluksen inline-skriptejä.
- Tarkistetaan JS-syntaksi `github-only.js`-tiedostolle.
- Tarkistetaan, ettei HTML-sivujen nykyisiä `/api/live`, `/api/match`, `/api/standings`, `/api/default-match` ja `/api/graphics-state` -kutsuja tarvitse poistaa.
- TorneoPalin CORS-toimintaa ei voitu vahvistaa tässä työympäristössä verkkoyhteyden DNS-eston vuoksi; se on ratkaiseva julkaistavan version hyväksymistesti.


## v3: suorat TorneoPal-haut
Sarjataulukko (`sarjataulukko.html`) ja ottelun kokoonpanot (`kokoonpanot.html?ottelu=ID`) hakevat nyt suoraan osoitteista `https://finbandy.torneopal.fi/taso/sarja.php` ja `https://finbandy.torneopal.fi/taso/ottelu.php`. Tämä ohittaa GitHub Pagesin `/api/...` 404 -polut. Selain ei kuitenkaan voi ohittaa TorneoPalin CORS-rajoituksia; jos selain estää haun, tarvitaan CORS-sallittu lähde tai palvelinpuolen välityspalvelin.
