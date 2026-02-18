# L2 DPS Calculator

[![Lighthouse SEO](https://img.shields.io/badge/SEO-98%2F100-brightgreen)](https://xiscob.github.io/l2-dps-calculator/)
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-95%2F100-brightgreen)](https://xiscob.github.io/l2-dps-calculator/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://xiscob.github.io/l2-dps-calculator/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)

> **Free Lineage 2 DPS Calculator** - Parse combat logs, calculate Damage Per Second (DPS), analyze skills with min/max/average damage and critical hit rates. Supports 10 languages.

🌐 **Live Demo:** [https://xiscob.github.io/l2-dps-calculator/](https://xiscob.github.io/l2-dps-calculator/)

![L2 DPS Calculator Screenshot](https://xiscob.github.io/l2-dps-calculator/screenshot.png)

## Features

- 📊 **DPS Calculation** - Parse Lineage 2 combat logs and calculate DPS with detailed skill breakdowns
- 🌍 **Multi-Language Support** - Available in 10 languages:
  - English, Español, Ελληνικά, Português
  - 简体中文, 한국어, Tiếng Việt, 日本語
  - Polski, Русский
- 📱 **Mobile Responsive** - Works on desktop, tablet, and mobile devices
- 💾 **Save & Compare** - Save multiple DPS results and compare skills across runs
- 📷 **Export** - Copy results to clipboard or export as images
- 🎯 **Onboarding** - Interactive tutorial for new users
- 🌙 **Dark Theme** - Lineage 2 inspired dark UI

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

# Deploy to GitHub Pages
npm run deploy
```

## How to Use

1. **Capture Combat Logs** - In Lineage 2, use `///textcapture on` to start recording
2. **Upload** - Drag & drop your `.log` file or paste the content
3. **Set Duration** - Enter the fight duration in seconds
4. **Calculate** - Click "Calculate DPS" to analyze
5. **Save** - Name and save your results to compare later

## What is a DPS Calculator?

A **DPS (Damage Per Second) Calculator** is a gaming tool that analyzes combat performance by:

- Parsing game log files to extract damage data
- Calculating total damage output over time
- Breaking down performance by individual skills
- Tracking critical hit rates and accuracy
- Comparing performance across multiple sessions

This tool is specifically designed for **Lineage 2** (L2), a popular MMORPG, but can work with similar combat log formats.

## Project Structure

```
├── public/                    # Static assets
│   ├── robots.txt            # SEO crawler directives
│   ├── sitemap.xml           # XML sitemap for search engines
│   ├── llms.txt              # AI crawler content governance
│   ├── index.html            # Main HTML with SEO meta tags
│   ├── manifest.json         # PWA manifest
│   └── ...
├── src/
│   ├── i18n/                 # Internationalization (10 languages)
│   ├── App.js                # Main app component
│   ├── LogProcessor.js       # Core DPS calculation
│   ├── ComparisonDisplay.js  # Skill comparison table
│   ├── Onboarding.js         # Tutorial modal
│   └── ...
├── .github/
│   └── workflows/
│       └── seo-audit.yml     # Automated SEO testing
├── SEO-AUDIT.md              # SEO audit report
├── IMPLEMENTATION-LOG.md     # SEO implementation details
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

- **Framework:** React 18.2.0
- **Build Tool:** Create React App
- **Language:** JavaScript (ES6+)
- **Styling:** CSS3 with responsive design
- **Icons:** FontAwesome
- **Screenshots:** html2canvas
- **Testing:** Jest with React Testing Library
- **Deployment:** GitHub Pages

## SEO & AI Indexing

This project implements comprehensive search optimization:

### Search Engine Optimization
- ✅ XML Sitemap with image references
- ✅ Multi-agent robots.txt (Google, Bing, AI bots)
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card meta tags
- ✅ JSON-LD structured data
- ✅ Canonical URLs
- ✅ PWA manifest with screenshots

### AI Indexing Support
- ✅ LLMs.txt for AI content governance
- ✅ GPTBot, ClaudeBot, PerplexityBot access
- ✅ Structured data for AI comprehension
- ✅ Semantic HTML5 markup

### Performance
- ✅ Lighthouse SEO Score: 98/100
- ✅ Lighthouse Accessibility: 95/100
- ✅ Preconnect and DNS-prefetch optimizations
- ✅ Font display swap for performance

See [SEO-AUDIT.md](./SEO-AUDIT.md) for detailed audit report.

## Adding a New Language

To add support for a new language:

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

**Privacy Note:** All data is stored locally in your browser. No combat log data is transmitted to any server.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [AGENTS.md](./AGENTS.md) for development documentation.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**@Xiscoteon**

- GitHub: [@Xiscob](https://github.com/Xiscob)
- Project: [https://github.com/Xiscob/l2-dps-calculator](https://github.com/Xiscob/l2-dps-calculator)
- Live Demo: [https://xiscob.github.io/l2-dps-calculator/](https://xiscob.github.io/l2-dps-calculator/)

## Acknowledgments

- Lineage 2 is a trademark of NCSoft Corporation
- This tool is not affiliated with or endorsed by NCSoft
- Built with ❤️ for the Lineage 2 community

---

<p align="center">
  <a href="https://xiscob.github.io/l2-dps-calculator/">Try it Live</a> •
  <a href="https://github.com/Xiscob/l2-dps-calculator/issues">Report Bug</a> •
  <a href="https://github.com/Xiscob/l2-dps-calculator/issues">Request Feature</a>
</p>
