## 1. Áttekintés
### A board.js az oldalon a boardért felel, amely a fő része a web-appnak. A boardon található az összes task ami egy boardhoz tartozik.

## 2. Jelenlegi helyzet
### Jelenleg a darkMode nem univerzálisan, hanem a board js-ben van lekezelve. A move column és card is a board js-ben van, a backend és frontend is egyszerre. Benne vannak a handle részek és a handle confirm részek. Az AGI generate/open/reload/review részek is a board js-ben vannak. A Modify-ok is itt vannak implementálva A toggle/mouse enter is itt van. A sort/filter is itt van implementálva 


## 3. Vágyálom rendszer
### Először el kell érnünk, hogy a board.js listája egy globális szinten elérhető lista legyen, ezt Context()-el lehetne elérni. Ezután lehet kisebb javascriptekre bontani a több ezer soros board.js-t. A column-okkal és taskokkal kapcsolatos mozgatásokat egy MoveItems.js-be lehetne szedni, ami felelős lesz az előbb felsorolt itemek boardon mozgatásáért. A taskokért, buttonökért, a taskokon belül a kis opciókért handle_ nevű metódusok felelősek, ezeket egybe lehetne szedni egy ItemHandler.js fájlba. Az AGI-ért felelős open, generate és minden AGI-val kapcsolatos metódusokat AGIHandler.js-be lehetne szedni. Az összes modify metódust egy külön fájlba lehetne szedni, ami csak a taskok, és egyéb a board-on található és módosítható itemekért felelős, ez a ModifierHandler.js lehetne. Szintén egy új js-be lehetne szedni az egér reszponzitásért felelős metódusokat, ezek mehetnének a MouseHandler.js-be.A taskokat filterezni és rendezni lehet, mint a jelenlegi rendszerben is le van írva, ez a board.js-ben van. Ezt a két dolgot, a sort-ot és filtert 2 külön fájlba lehetne rendezni, a Sort.js-be és Filter.js-be.


## 4. Funkcionális követelmények

## 5. Rendszerre vonatkozó törvények, szabványok, ajánlások

### Az alkalmazásunk nyílt forráskódú, bárki letöltheti/használhatja. Értékesítése szigorúan tilos!

## 6. Jelenlegi üzleti folyamatok modellje

## 7. Igényelt üzleti folyamatok modellje

## 8. Követelménylista