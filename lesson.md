# Lesson Notes — BTC Fear & Greed Dashboard

> Wnioski po zmianach zapisujemy tutaj, żeby kolejne iteracje nie wracały do tych samych błędów.

---

### 2026-04-17 — Official F&G thresholds must match the source
- **Kontekst:** Dashboard używa oficjalnego feedu Alternative.me.
- **Wniosek:** Strefy trzeba mapować dokładnie do metodologii źródła: `0-24`, `25-44`, `45-54`, `55-74`, `75-100`.
- **Reguła:** Nie rozbijaj tych progów na własne zakresy w tabelach ani tooltipach bez wyraźnego oznaczenia, że to autorska interpretacja.

### 2026-04-17 — Composite score cannot normalize on future history
- **Kontekst:** Weekly composite score używał MACD i WaveTrend.
- **Wniosek:** Normalizacja po całej próbce robi future leak i zawyża wiarygodność backtestu.
- **Reguła:** Dla score’ów historycznych używaj bounded transforms albo rolling normalization; nie korzystaj z wiedzy o przyszłych minimach i maksimach.

### 2026-04-17 — Missing indicator values should reduce coverage, not fake neutrality
- **Kontekst:** Część wskaźników była wcześniej wypełniana zerami lub neutralnymi wartościami.
- **Wniosek:** To zaciera warm-up i tworzy pozornie poprawne sygnały tam, gdzie model jeszcze nie był gotowy.
- **Reguła:** Licz komponent tylko wtedy, gdy ma pełne dane; końcowy score ma przeliczać wagi tylko dla dostępnych sygnałów i pokazywać coverage.

### 2026-04-17 — Backtest tables must be computed, not hardcoded
- **Kontekst:** Historyczne win rate’y były wpisane ręcznie.
- **Wniosek:** Ręczne liczby szybko odklejają się od logiki modelu i od realnie pobranej historii.
- **Reguła:** Tabele statystyczne licz dynamicznie z tych samych danych, które karmią wykres i wskaźnik.

### 2026-04-17 — ETH uses market-wide sentiment, not an official ETH-native index
- **Kontekst:** Ten sam feed F&G był nakładany na BTC i ETH.
- **Wniosek:** Alternative.me nadal opisuje oficjalny indeks jako bitcoin-focused, więc dla ETH to jest tylko overlay sentymentu rynkowego.
- **Reguła:** W UI i opisach dla ETH zawsze zaznaczaj, że to market-wide sentiment proxy, a nie oficjalny ETH Fear & Greed.

### 2026-04-17 — Selective staging is safer than `git add -A`
- **Kontekst:** Repo zawiera obok kodu także notatki i lokalne pliki pomocnicze.
- **Wniosek:** Łatwo przypadkiem wypchnąć niepowiązane zmiany użytkownika, jeśli staging jest zbyt szeroki.
- **Reguła:** Do commita dodawaj tylko pliki związane z bieżącą zmianą; szczególnie ostrożnie traktuj `PROJECT_STATE.md`, `lessons.md` i `.agent/`.

### 2026-04-17 — Cache should fall back, not corrupt history
- **Kontekst:** Dashboard pobiera pełną historię cen i F&G bez backendu.
- **Wniosek:** Cache w przeglądarce mocno poprawia szybkość, ale przy błędzie sieci nie można nadpisywać poprawnego cache'a uciętym datasetem.
- **Reguła:** Przy fetch failure wracaj do ostatniego sensownego cache'a i zapisuj nowe dane dopiero po poprawnym, pełnym sczytaniu.

### 2026-04-17 — Heuristic score must not look like a calibrated percent
- **Kontekst:** Weekly composite był prezentowany w miejscach jakby był dosłownym prawdopodobieństwem.
- **Wniosek:** Nawet dobry ranking sygnałów nie jest jeszcze probabilistycznie skalibrowaną miarą.
- **Reguła:** W UI używaj nazwy `Composite Score`, trzymaj oś i legendy bez `%`, a procent zostaw tylko dla historycznych hit rate'ów i coverage modelu.

### 2026-04-17 — Sample size should be visible per horizon
- **Kontekst:** Jeden bucket może mieć inną liczbę obserwacji dla 1W, 4W, 13W i 52W.
- **Wniosek:** Samo jedno `n` na wiersz nie wystarcza do oceny jakości tabeli.
- **Reguła:** Pokazuj liczebność nie tylko dla bucketu, ale też dla każdej komórki / horyzontu forward return.

### 2026-04-17 — Data quality should be visible in the UI, not hidden in code
- **Kontekst:** Dashboard korzysta z live fetchy, cache i fallbacku, ale wcześniej użytkownik widział tylko końcowy wykres.
- **Wniosek:** Bez jawnej informacji o źródle i świeżości danych trudno ocenić, czy patrzymy na live API, cache czy tryb awaryjny.
- **Reguła:** Pokazuj w nagłówku chartu stan źródła (`Live API`, fresh cache, fallback cache), ostatnią datę i podstawową głębokość danych.

### 2026-04-17 — Calibration must show sample depth together with hit rate
- **Kontekst:** Sam composite score jest heurystyczny i nie jest z definicji skalibrowanym prawdopodobieństwem.
- **Wniosek:** Sama linia hit rate może wyglądać przekonująco nawet wtedy, gdy dany bucket ma bardzo mało obserwacji.
- **Reguła:** Gdy pokazujesz kalibrację score'u, zawsze zestaw ją z liczebnością bucketów i oznacz, że małe `n` są tylko eksploracyjne.

### 2026-04-17 — Visible range should be explicit on interactive charts
- **Kontekst:** Dashboard ma presety czasu, custom date range i drag-zoom.
- **Wniosek:** Bez jawnej informacji o aktualnym zakresie łatwo błędnie czytać ostatni score albo sample depth jako „cały wykres”.
- **Reguła:** W chartach interaktywnych pokazuj aktywny zakres / zoom jako element jakości danych, nie tylko w kontrolkach.

### 2026-04-17 — Single-file dashboards need a repeatable smoke test
- **Kontekst:** Runtime test w Safari utknął na ograniczeniu `Allow JavaScript from Apple Events`, mimo że sama strona się otwiera.
- **Wniosek:** Dla single-file dashboardu nie można polegać wyłącznie na ręcznym browser checku ani na samym syntax checku.
- **Reguła:** Trzymaj w repo lokalny smoke test z mockami DOM i fetch, który sprawdza render kluczowych paneli, tabel i chartów po każdej większej zmianie.

### 2026-04-17 — User-facing UI copy must stay in English
- **Kontekst:** Some tooltip explanations and hero copy were left in Polish while the product itself is meant to be English-first.
- **Wniosek:** Mixed UI language makes the dashboard feel inconsistent and less professional.
- **Reguła:** Keep all user-facing page content in English by default, including tooltips, helper text, status copy, and metadata descriptions, unless the user explicitly asks for another language.

### 2026-04-17 — GitHub Pages fixes are not live until `master` is updated
- **Kontekst:** The working branch had the English UI, but the public GitHub Pages site still served the older Polish tooltip copy.
- **Wniosek:** In this repo, pushing only the feature branch is not enough when the user is validating the public URL.
- **Reguła:** If the task is meant to change the live GitHub Pages site, publish the reviewed commit to `master`, then verify the live URL for the exact copy that changed.

### 2026-04-17 — Tabs need panel-scoped controls, not shared chart chrome
- **Kontekst:** After adding `Chart / Backtest / Calibration` tabs, the chart controls still stayed visible on non-chart tabs, making the layout feel broken.
- **Wniosek:** A tabbed analytics workspace only feels coherent when each tab owns the controls that matter to that view.
- **Reguła:** Keep range pickers, legends, and sliders inside the `Chart` panel, and render `Backtest` / `Calibration` as their own clean surfaces with dedicated spacing and table wrappers.

### 2026-04-17 — Dense chart surfaces should use one shared top grid
- **Kontekst:** The chart views had the summary data on the far left and filters on the far right, leaving a large dead zone in the middle.
- **Wniosek:** Premium analytics layouts feel tighter when live stats and filters share the same top workspace instead of floating in separate bands.
- **Reguła:** In desktop chart views, place summary metrics and filter controls inside one compact top grid above the chart; shrink legend/filter chrome before adding more vertical stacks.

### 2026-04-17 — Range navigation should live in a compact brush, not a control bar
- **Context:** The chart toolbar stacked time presets, date fields, and reset actions above the visual, which made the workspace feel busy and pushed attention away from the chart itself.
- **Takeaway:** A mini overview navigator communicates the visible range faster while using less space than buttons plus date inputs.
- **Rule:** For dense analytics charts, prefer a compact brush navigator with one clear range label and one reset action over long preset rows and manual date pickers.

### 2026-04-17 — Premium dashboard alignment should be verified with a browser-side JS audit
- **Context:** Visual tweaks to the chart header can still leave subtle misalignment between the insight column, control column, quality cards, and range navigator.
- **Takeaway:** Screenshot review helps, but a browser-side JS audit catches whether desktop columns truly share the same edges and dimensions.
- **Rule:** For premium dashboard layout changes, run a browser JS audit that measures the live DOM on a desktop viewport and checks column height parity, card uniformity, and chart-to-navigator width alignment.
