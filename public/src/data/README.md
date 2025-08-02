# Dynamic Statistics System

This system automatically updates the statistics displayed on the main index.html page.

## How It Works

### 1. **Automatic Updates (JavaScript)**
The main page automatically tries to:
1. Load statistics from `stats.json` (preferred)
2. Count files dynamically by checking known file paths
3. Fall back to default values if both methods fail

### 2. **Manual Updates (Node.js Script)**
Run the update script to count actual files and update `stats.json`:

**Windows:**
```bash
update-stats.bat
```

**Linux/Mac:**
```bash
chmod +x update-stats.sh
./update-stats.sh
```

**Direct Node.js:**
```bash
node src/scripts/update-stats.js
```

### 3. **Statistics Tracked**

- **Blog Posts**: Counts HTML files in `src/pages/blog/` (excluding index.html)
- **News Articles**: Counts HTML files in `src/pages/news/` (excluding index.html)
- **Years Journey**: Calculated from start date (2021-01-01)
- **Key Offerings**: Fixed at 1 (Agentic Architecture)
- **Total Views**: Estimated based on content count
- **Subscribers**: Estimated growth based on content

### 4. **File Structure**

```
src/
├── data/
│   ├── stats.json          # Statistics data file
│   └── README.md           # This file
├── scripts/
│   └── update-stats.js     # Update script
└── pages/
    ├── blog/               # Blog posts directory
    └── news/               # News articles directory
```

### 5. **Adding New Content**

When you add new blog posts or news articles:

1. **Add the HTML file** to the appropriate directory
2. **Run the update script** to refresh statistics
3. **The main page will automatically** display updated counts

### 6. **Customization**

Edit `stats.json` manually for custom values:

```json
{
  "blog": {
    "count": 10,
    "lastUpdated": "2024-01-15"
  },
  "news": {
    "count": 15,
    "lastUpdated": "2024-01-15"
  }
}
```

### 7. **Integration with Build Process**

Add to your build script or CI/CD pipeline:

```bash
# Update statistics before deployment
node src/scripts/update-stats.js
```

This ensures statistics are always current when the site is deployed.
