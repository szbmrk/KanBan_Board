## 1. Jelenlegi helyzet leírása
### A projekt kiindulási pontja a mindennapi szükséglet, hogy egy hatékony, könnyen kezelhető digitális feladatkezelő rendszerre van szükség a projektmenedzsment területén. A jelenlegi helyzetben felmerült az igény egy olyan platformra, amely lehetővé teszi a felhasználók számára, hogy átláthatóan és hatékonyan kövessék a projektek fejlődését, és könnyedén kommunikáljanak a csapatukkal.

## 2. Vágyálomrendszer leírása
### A Kanban Board projekt vágyálomrendszerének célja egy olyan digitális felület kialakítása, amely lehetővé teszi a felhasználók számára a könnyű és interaktív projektkezelést, miközben a fejlesztés és módosítások egyszerűségét is biztosítja. Az oldalnak emellett intuitívnak és könnyen használhatónak kell lennie minden felhasználó számára, beleértve azokat is, akik kevésbé jártasak az informatikai világban.

## 3. Jelenlegi üzleti folyamatok modellje
### A KanBan Board projekt új üzleti folyamatai egy digitális projektmenedzsment eszközt hoznak létre, amely átláthatóságot, hatékonyságot és könnyű együttműködést biztosít a csapatok számára. A projekt célja, hogy felülmúlja a jelenlegi módszerek korlátait és javítsa a projektkezelés hatékonyságát.

## 4. Igényelt üzleti folyamatok modellje
### A projekt igényelt üzleti folyamatai egy mobilis és rugalmas projektmenedzsment alkalmazást eredményeznek, amely ötvözi a projektkezelés funkcionalitását és a szórakozást a felhasználók számára. A rendszer tervezése során kiemelten kezeljük a könnyű elérhetőséget, a kollaborációt és a bővíthetőséget.

## 5. Követelménylista

## 6. Használati esetek

## 7. Megfeleltetés

## 8. Képernyőtervek
Belépés

![KanBan projekt - login page](./loginPage.png)

Regisztráció

![KanBan projekt - register page](./registerPage.png)

Dashboard

![KanBan projekt - dashboard page](./dashboardPage.png)

Board

![KanBan projekt - board page](./boardPage.png)

Teams

![KanBan projekt - teams page](./teamsPage.png)

Permission table

![KanBan projekt - permission table page](./permissonPage.png)

Edit profile

![KanBan projekt - edit profile page](./editProfilPage.png)

## 9. Forgatókönyvek

1. A felhasználó bejelentkezés után a főoldalon találja magát, ahol alapértelmezetten a dashboard jelenik meg, ahol az általa hozzáférhető táblákat látja.
2. Egy board kártyára kattintva az oldal átnavigál a /board útvonalra.
3. Az add new card-ra kattintva új oszlopot hoz létre.
4. Az oszlop nevére duplán kattintva át tudja nevezni.
5. Az add new task gombra kattintva tud új task-ot létrehozni.
6. A navbar-on található profile gombra kattintva megjelenik egy dropdown.
7. Az Edit profil menüre kattintva átnavigál a /editprofile page-re.
8. A /editprofile page-n tudja szerkeszteni az adatait.
9. A navbar-on található harang gombbal átnavigál a /notifications page-re.
10. A /notifiactions page-n láthatók az értesítések.
11. A sidebar-on a /teams menüben tud új csapatot létrehozni.
12. A csapat neve melletti menüben tudja a csapat nevét, a csapat tagokat módosítani és a csapatot törölni, ha van ehhez joga.
13. A sidebar-on Permission table menüben tudja megtekinteni azokat a táblákat, amin joga van módosítani a jogosultságot és a szerepköröket.
14. A táblára kattintva jelennek meg a szerepkörök és a hozzájuk tartozó jogosultságok.

## 10. Funckió - követelmény megfeleltetése

## 11. Fogalomszótár:

- publikálás: nyilvánossá tétel
- regisztráció: jelentkezés, beiratkozás
- formázott szöveg: szöveg, ami írható vastagon, dőlten vagy áthúzva.
- navbar: az oldal tetején található sáv
- sidebar: az oldal bal oldalán található sáv
- bemenet: a szövegdobozokba átadott információ

### 1. Kanban Board:

A Kanban Board egy projektmenedzsment eszköz, amely vizuális táblázatokat használ a feladatok követésére és kezelésére. A projekt folyamatai oszlopokba vannak szervezve, és a feladatok kártyákként jelennek meg, amelyek az oszlopok között mozognak az előrehaladás során.

### 2. UI (Felhasználói Felület):

A Kanban Board projekt UI (felhasználói felülete) a rendszer által nyújtott vizuális felület, amely lehetővé teszi a felhasználók számára a projektjeik és feladataik hatékony kezelését. A UI feladata, hogy felhasználóbarát és könnyen navigálható legyen.

### 3. Reszponzív:

A Kanban Board projekt reszponzív tervezése lehetővé teszi, hogy a felület mérete automatikusan alkalmazkodjon az eszköz képernyőjéhez. Így biztosítva a felhasználók számára optimális megjelenést és használhatóságot különböző eszközökön, például számítógépen, táblagépen vagy mobiltelefonon.

### 4. Free of Charge (Ingyenesen Használható):

A Kanban Board projekt ingyenesen használható, ami azt jelenti, hogy a felhasználóknak nem kell fizetniük a szolgáltatásért. Az alapvető funkcionalitások, mint például a projekt- és feladatkezelés, elérhetőek ingyenesen a felhasználók számára.

### 5. Kártya:

A Kanban Board projektben a kártyák a feladatokat vagy projekteket reprezentálják. Ezek a kártyák mozognak az oszlopok között, tükrözve a feladatok állapotait és folyamatát.

### 6. Osztályozás és Szűrés:

A Kanban Board projekt lehetőséget biztosít a feladatok és projektek könnyű kategorizálására és szűrésére. Ez segíti a felhasználókat abban, hogy könnyen megtalálják a számukra releváns információkat.

### 7. Kollaboráció:

A projekt csapattagjai közötti hatékony kommunikáció lehetővé teszi a feladatokról és projektekről szóló információk megosztását. A kollaborációs eszközök segítik a csapatok együttműködését a projekt teljesítése érdekében.

### 8. Rugalmasság és Testreszabhatóság:

A Kanban Board projekt rugalmasságot és testreszabhatóságot kínál a felhasználóknak. Az oszlopok és kártyák személyre szabhatók a projekt egyedi igényei szerint, így alkalmazkodva a különböző projektekhez és csapatokhoz.
