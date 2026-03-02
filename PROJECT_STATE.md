# BTC Price vs. Crypto Fear And Greed — Project State

## Opis
Interaktywny wykres cenowy BTC kolorowany sentymentem Fear & Greed Index.

## Funkcje
- **Pojedyncza linia cenowa BTC** kolorowana kolorem F&G (zielony = Ext Fear/kupuj, czerwony = Ext Greed/sprzedaj)
- **Pełna historia od 2018** — dane z Binance API (klines, 1d interval)
- **F&G Index** z Alternative.me API (pełna historia)
- **Presetowe zakresy czasu**: 1M, 3M, 6M, 1Y, 2Y, 5Y, ALL
- **Ręczne zakresy dat**: pola From/To
- **Drag-to-zoom**: kliknij i przeciągnij na wykresie by zaznaczyć okres
- **Przycisk Reset**: przywraca widok 1Y po zoomowaniu
- **Legendy z dim/highlight**: kliknij sentymenty by podświetlić/wygasić segmenty (białe gdy wygaszone)
- **Skala logarytmiczna** osi Y z czystymi tickami ($5k, $10k, $20k, $50k, $100k...)
- **Tooltip** z ceną BTC + wartością F&G + etykietą sentymentu

## Kolory sentymentu (odwrócone, logika tradingowa)
| Sentiment | Kolor | Zakres | Sygnał |
|-----------|-------|--------|--------|
| Ext Fear | 🟢 `#10b981` | 0-24 | KUP |
| Fear | 🟢 `#22c55e` | 25-44 | — |
| Neutral | 🟡 `#eab308` | 45-55 | — |
| Greed | 🟠 `#f97316` | 56-74 | — |
| Ext Greed | 🔴 `#ef4444` | 75-100 | SPRZEDAJ |

## Stack techniczny
- HTML + Vanilla JS + CSS (single file: `index.html`)
- Chart.js 4.4.4 + chartjs-adapter-date-fns
- Binance API (BTC price, free, no auth)
- Alternative.me API (F&G index, free)
- Google Fonts (Inter)

## Historia zmian
1. Początek — replikacja wykresu z Alphractal z oddzielną linią F&G i BTC
2. Fix bug z znikaniem wykresu przy filtrowaniu sentamentu (segment API)
3. Przeniesienie kolorów F&G na linię cenową BTC (jedno line chart)
4. Zamiana CoinGecko → Binance API (pełna historia)
5. Zmiana DIM_COLOR z niewidocznego szarego na biały (50% opacity)
6. Odwrócenie kolorów (Ext Fear = zielony/kupuj, Ext Greed = czerwony/sprzedaj)
7. Dodanie ręcznych date pickerów (From/To)
8. Dodanie drag-to-zoom na wykresie + przycisk Reset
9. Naprawa skali Y (czyste ticki zamiast gęstych $1k)
