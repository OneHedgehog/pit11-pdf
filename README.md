# PIT-11 PDF

**[English](#english) · [Polski](#polski)** · Website: https://USERNAME.github.io/pit11-pdf/

---

## English

A free Chrome extension that adds a **Download document** button to the PIT-11 preview in
[Twój e-PIT](https://www.podatki.gov.pl/twoj-e-pit/), just like the one on your PIT-37.
One click gives you a clean, correctly laid-out A4 PDF.

### Why

Twój e-PIT only shows the PIT-11 as a preview, with no download button. Printing that page
from the browser gives overlapping sections, broken page breaks and a missing scrollbar.

The extension takes the form from the preview, removes the portal's scroll-blocking style and
leftover scripts, fits every form page onto one A4 sheet and opens the print dialog with the
file name already filled in (`PIT-11_<YEAR>_<PAYER>`).

### Install

Coming soon to the Chrome Web Store. Until then:

1. Download this repository as a ZIP (**Code → Download ZIP**) and unpack it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder.

### Use

1. Log in to Twój e-PIT and open **Your source data → PIT-11 → Preview**.
2. Click **Download document**.
3. In the print dialog choose **Save as PDF**, untick **Headers and footers**, click **Save**.

### Privacy

The extension collects, stores and sends nothing. It runs only on `epit.podatki.gov.pl`,
asks for no extra permissions, makes no network requests and loads no remote code. All the
logic is in [`extension/content.js`](extension/content.js).

### Disclaimer

Independent project, not affiliated with the Ministry of Finance or the National Revenue
Administration (KAS). If the portal changes its layout the button may stop appearing; please
open an issue.

---

## Polski

Darmowe rozszerzenie do Chrome, które dodaje przycisk **Pobierz dokument** do podglądu PIT-11
w [Twój e-PIT](https://www.podatki.gov.pl/twoj-e-pit/) – tak jak przy PIT-37. Jedno kliknięcie
i masz czysty, poprawnie złożony PDF w formacie A4.

### Po co

Twój e-PIT pokazuje PIT-11 tylko w podglądzie, bez przycisku pobierania. Drukowanie tej strony
przez przeglądarkę daje nachodzące na siebie sekcje, złe podziały stron i znikający pasek
przewijania.

Rozszerzenie pobiera formularz z podglądu, usuwa styl portalu blokujący przewijanie i
pozostałe skrypty, dopasowuje każdą stronę formularza do jednego arkusza A4 i otwiera okno
drukowania z gotową nazwą pliku (`PIT-11_<ROK>_<PŁATNIK>`).

### Instalacja

Wkrótce w Chrome Web Store. Do tego czasu:

1. Pobierz to repozytorium jako ZIP (**Code → Download ZIP**) i rozpakuj.
2. Otwórz `chrome://extensions` i włącz **Tryb dewelopera**.
3. Kliknij **Załaduj rozpakowane** i wybierz folder `extension`.

### Użycie

1. Zaloguj się do Twój e-PIT i otwórz **Twoje dane źródłowe → PIT-11 → Podgląd**.
2. Kliknij **Pobierz dokument**.
3. W oknie drukowania wybierz **Zapisz jako PDF**, odznacz **Nagłówki i stopki**, kliknij **Zapisz**.

### Prywatność

Rozszerzenie niczego nie zbiera, nie przechowuje ani nie wysyła. Działa tylko na
`epit.podatki.gov.pl`, nie wymaga dodatkowych uprawnień, nie łączy się z siecią i nie
ładuje zdalnego kodu. Cała logika jest w [`extension/content.js`](extension/content.js).

### Zastrzeżenie

Niezależny projekt, niezwiązany z Ministerstwem Finansów ani Krajową Administracją Skarbową.
Jeśli portal zmieni wygląd, przycisk może przestać się pojawiać – zgłoś wtedy problem (issue).

---

## Repository layout

```
extension/   Chrome extension (Manifest V3): manifest.json, content.js
docs/        Website served by GitHub Pages (index.html, EN/PL)
```

## Publishing the website (GitHub Pages)

**Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder: `/docs`.**

## License

[MIT](LICENSE)
