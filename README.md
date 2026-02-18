# L2 DPS Calculator

A React-based web application for calculating Damage Per Second (DPS) statistics from Lineage 2 game combat logs. Supports 10 languages and works on both desktop and mobile devices.

![L2 DPS Calculator](https://xiscob.github.io/l2-dps-calculator/screenshot.png)

## Features

- 📊 **DPS Calculation** - Parse combat logs and calculate DPS with detailed skill breakdowns
- 🌍 **Multi-Language Support** - Available in 10 languages:
  - English, Español, Ελληνικά, Português
  - 简体中文, 한국어, Tiếng Việt, 日本語
  - Polski, Русский
- 📱 **Mobile Responsive** - Works on desktop, tablet, and mobile devices
- 💾 **Save & Compare** - Save multiple DPS results and compare skills across runs
- 📷 **Export** - Copy results to clipboard or export as images
- 🎯 **Onboarding** - Interactive tutorial for new users
- 🌙 **Dark Theme** - Lineage 2 inspired dark UI

## Live Demo

https://xiscob.github.io/l2-dps-calculator

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Xiscob/l2-dps-calculator.git
cd l2-dps-calculator

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## How to Use

1. **Capture Combat Logs** - In Lineage 2, use `///textcapture on` to start recording
2. **Upload** - Drag & drop your `.log` file or paste the content
3. **Set Duration** - Enter the fight duration in seconds
4. **Calculate** - Click "Calculate DPS" to analyze
5. **Save** - Name and save your results to compare later

## Project Structure

```
├── public/                    # Static assets
├── src/
│   ├── i18n/                 # Internationalization
│   │   ├── index.js          # Language configuration
│   │   ├── LanguageContext.js # React context for i18n
│   │   ├── en.json           # English translations
│   │   ├── es.json           # Spanish translations
│   │   ├── el.json           # Greek translations
│   │   ├── pt-BR.json        # Portuguese translations
│   │   ├── zh.json           # Chinese (Simplified) translations
│   │   ├── ko.json           # Korean translations
│   │   ├── vi.json           # Vietnamese translations
│   │   ├── ja.json           # Japanese translations
│   │   ├── pl.json           # Polish translations
│   │   └── ru.json           # Russian translations
│   ├── App.js                # Main app component
│   ├── App.css               # Main app styles
│   ├── LogProcessor.js       # Core DPS calculation
│   ├── LogProcessor.css      # LogProcessor styles
│   ├── ComparisonDisplay.js  # Skill comparison table
│   ├── ComparisonDisplay.css
│   ├── Onboarding.js         # Tutorial/onboarding
│   ├── Onboarding.css
│   ├── LanguageSelector.js   # Language dropdown
│   ├── LanguageSelector.css
│   ├── BuffDebuffChecker.js  # Placeholder component
│   └── BuffDebuffChecker.css
├── package.json
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run development server at http://localhost:3000 |
| `npm run build` | Create production build in `/build` folder |
| `npm test` | Run tests in interactive watch mode |
| `npm run deploy` | Deploy to GitHub Pages |

## Technology Stack

- **Framework**: React 18.2.0
- **Build Tool**: Create React App
- **Language**: JavaScript (ES6+)
- **Styling**: CSS3 with responsive design
- **Icons**: FontAwesome
- **Screenshots**: html2canvas
- **Testing**: Jest with React Testing Library
- **Deployment**: GitHub Pages

## Adding a New Language

To add a new language:

1. Create a new JSON file in `src/i18n/` (e.g., `fr.json` for French)
2. Copy the structure from `en.json` and translate all values
3. Import the file in `src/i18n/index.js`
4. Add the language to the `languages` object:

```javascript
import fr from './fr.json';

export const languages = {
  // ... existing languages
  fr: {
    code: 'fr',
    name: 'Français',
    translation: fr
  }
};
```

The language will automatically appear in the language selector.

## Data Storage

The app uses browser localStorage to persist:
- Saved DPS results
- User's language preference
- App version tracking
- Onboarding completion status

## License

MIT

## Author

@Xiscoteon

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
