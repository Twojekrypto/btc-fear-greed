# Lessons Learned — BTC Fear & Greed Dashboard

> Wzorce błędów i reguły wyciągnięte z korekt użytkownika.
> Przeglądaj na początku każdej sesji, aby unikać powtórek.

---

## Format wpisu

```
### [DATA] — Krótki opis problemu
- **Kontekst:** Co było robione
- **Błąd:** Co poszło nie tak
- **Reguła:** Zasada na przyszłość
```

---

### 2026-03-04 — Architektura single-file
- **Kontekst:** Cały dashboard to jeden `index.html` (~2400 linii)
- **Reguła:** Używaj factory pattern (`createFngChart`, `createWinProbChart`) do współdzielenia logiki BTC/ETH. Nie duplikuj kodu.

### 2026-03-04 — X-axis range bug
- **Kontekst:** X-axis nie pokazywał lat na zakresie ALL
- **Błąd:** `range=0` powodował dzielenie przez zero w logice formatowania
- **Reguła:** Zawsze testuj edge case `range=0` / `ALL` po zmianach w osi czasu

### 2026-04-17 — Official F&G thresholds must match the source
- **Kontekst:** Dashboard używa oficjalnego feedu Alternative.me.
- **Błąd:** Własne progi w tabelach i opisach rozjeżdżały się z metodologią źródła.
- **Reguła:** Dla oficjalnego F&G trzymaj progi `0-24`, `25-44`, `45-54`, `55-74`, `75-100`, a każdą inną segmentację oznaczaj jako autorską.

### 2026-04-17 — Composite score cannot normalize on future history
- **Kontekst:** Weekly composite score używał MACD i WaveTrend.
- **Błąd:** Normalizacja po całej próbce robiła future leak i sztucznie poprawiała wrażenie jakości backtestu.
- **Reguła:** Dla historycznych score'ów używaj bounded transforms albo rolling normalization; nie korzystaj z przyszłych minimów i maksimów.

### 2026-04-17 — Missing values reduce coverage, they do not mean neutral
- **Kontekst:** Warm-up wskaźników na początku serii.
- **Błąd:** Wypełnianie braków zerami albo stałą neutralną zacierało fakt, że model nie był jeszcze gotowy.
- **Reguła:** Licz score tylko z dostępnych komponentów, pokazuj coverage i ustaw minimalny próg wiarygodności modelu.

### 2026-04-17 — Backtest tables must be computed from the same dataset
- **Kontekst:** Tabele skuteczności były ręcznie wpisane.
- **Błąd:** Ręczne liczby szybko odklejają się od prawdziwej logiki wskaźnika i pobieranej historii.
- **Reguła:** Tabele backtestowe licz dynamicznie z tych samych danych, które karmią wykres i score.

### 2026-04-17 — ETH overlay is not an official ETH-native F&G index
- **Kontekst:** Ten sam feed F&G był nakładany na BTC i ETH.
- **Błąd:** UI za słabo komunikował, że feed Alternative.me jest nadal bitcoin-focused.
- **Reguła:** Dla ETH opisuj F&G jako market-wide / BTC-centric sentiment proxy, nie jako oficjalny indeks ETH.

### 2026-04-17 — Use selective staging in this repo
- **Kontekst:** W repo są równolegle notatki i pliki robocze, które łatwo przypadkiem dorzucić do commita.
- **Błąd:** `git add -A` może wciągnąć niepowiązane zmiany użytkownika.
- **Reguła:** Stage'uj tylko konkretne pliki związane z bieżącą zmianą i dopiero potem commit / push.

### 2026-04-17 — Cache must prefer correctness over partial refresh
- **Kontekst:** Dashboard działa bez backendu i pobiera długą historię z zewnętrznych API.
- **Błąd:** Przy błędzie sieci łatwo skończyć z uciętą historią albo nadpisanym cache'em.
- **Reguła:** Używaj cache z TTL i fallbackiem do ostatniej poprawnej wersji; nie zapisuj częściowych danych jako nowego źródła prawdy.

### 2026-04-17 — Composite score should not be displayed as a percent probability
- **Kontekst:** Weekly score jest heurystycznym rankingiem setupu.
- **Błąd:** Etykiety z `%` na osi i w legendzie sugerują skalibrowane prawdopodobieństwo, którego model nie gwarantuje.
- **Reguła:** Dla heurystycznego modelu używaj nazwy `Composite Score`; procenty zostaw tylko dla historycznych hit rate'ów i coverage.

### 2026-04-17 — Show sample size per horizon, not only per bucket
- **Kontekst:** Dalsze horyzonty mają mniej obserwacji niż krótsze.
- **Błąd:** Jedno `n` na wiersz ukrywa różnicę między liczebnością dla 1W i 52W.
- **Reguła:** W tabelach backtestowych pokazuj `n` także dla każdej komórki / horyzontu.

### 2026-04-17 — Surface data quality in the chart header
- **Kontekst:** Dashboard działa na mieszance live fetchy, cache i fallbacków.
- **Błąd:** Jeśli UI nie pokazuje trybu źródła ani wieku danych, użytkownik łatwo zakłada, że wszystko jest równie świeże i live.
- **Reguła:** Obok wykresu pokazuj stan źródła (`Live API`, fresh cache, fallback cache), ostatnią datę i podstawową głębokość danych.

### 2026-04-17 — Calibration without sample depth is misleading
- **Kontekst:** Composite score ma służyć jako heurystyczny ranking setupów, nie gotowa miara probabilistyczna.
- **Błąd:** Linia kalibracji bez liczebności bucketów może sugerować pewność tam, gdzie są tylko pojedyncze obserwacje.
- **Reguła:** W calibration view zawsze łącz hit rate z `n` dla bucketu i jasno oznaczaj małe próbki jako eksploracyjne.

### 2026-04-17 — Interactive range context must be visible
- **Kontekst:** Dashboard ma kilka presetów czasu, custom date range i drag-zoom.
- **Błąd:** Jeśli aktualny zakres nie jest pokazany obok danych jakościowych, łatwo pomylić „widoczne teraz” z „całą historią”.
- **Reguła:** Pokazuj aktywny zakres / zoom jako część kontekstu chartu, nie tylko w kontrolkach nad wykresem.

### 2026-04-17 — Keep a local runtime smoke test for single-file dashboards
- **Kontekst:** Browser automation może być ograniczona przez ustawienia lokalnej przeglądarki albo brak sterowalnego runtime.
- **Błąd:** Sam syntax check nie mówi, czy po inicjalizacji rzeczywiście znikają loadery, wypełniają się tabele i renderują panele jakości.
- **Reguła:** Utrzymuj w repo smoke test z mockami DOM i fetch, który uruchamia inline script i sprawdza kluczowe runtime invariants.

### 2026-04-17 — GitHub Pages requires a production publish step
- **Kontekst:** Branch roboczy może zawierać poprawne UI, ale publiczny adres nadal może serwować starszy `master`.
- **Błąd:** Sam push feature brancha nie naprawia live site, jeśli user sprawdza publiczny URL GitHub Pages.
- **Reguła:** Gdy zmiana ma być widoczna na publicznym GitHub Pages, po pushu brancha opublikuj zatwierdzony commit także na `master` i zweryfikuj live HTML pod kątem konkretnej poprawki.

### 2026-04-17 — W tabbed analytics views, controls must belong to the active panel
- **Kontekst:** Po dodaniu zakładek `Chart / Backtest / Calibration` chartowe kontrolki nadal wisiały nad tabelami i kalibracją.
- **Błąd:** Wspólny toolbar dla wszystkich zakładek sprawia wrażenie rozjechanego layoutu i miesza kontekst użytkownika.
- **Reguła:** Range presets, date pickers, legends i sliders trzymaj tylko w panelu `Chart`; `Backtest` i `Calibration` renderuj jako osobne surface’y z własnym spacingiem i wrapperem dla tabel.

### 2026-04-17 — Summary metrics and filters should share one compact chart workspace
- **Kontekst:** Dane po lewej i filtry po prawej były rozdzielone na tyle mocno, że środek chartu zostawał pusty mimo dużej ilości informacji.
- **Błąd:** Rozbijanie summary i controls na osobne poziome pasy tworzy martwą przestrzeń i osłabia premium feel.
- **Reguła:** W desktopowym widoku chartu układaj live metrics i filtry w jednej górnej siatce nad wykresem; najpierw kompresuj chrome filtrów, dopiero potem dodawaj kolejne rzędy.

### 2026-04-17 — Prefer a brush navigator over stacked date controls
- **Kontekst:** Toolbar chartu miał osobne presety czasu, pola `From / To` i reset zoomu, przez co zajmował dużo miejsca i wizualnie konkurował z samym wykresem.
- **Błąd:** Rozbudowany control bar zwiększa clutter i spowalnia odczyt aktualnego zakresu, nawet jeśli funkcjonalnie działa poprawnie.
- **Reguła:** W gęstych chartach używaj kompaktowego mini-chart navigatora z jednym opisem aktywnego zakresu i jedną akcją resetu zamiast wielu presetów i ręcznych pól daty.
