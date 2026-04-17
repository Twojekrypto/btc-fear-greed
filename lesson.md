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
