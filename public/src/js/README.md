# Common Components System

This system provides consistent header and footer components across all pages of the RebootingwithAI website.

## Features

### 🎯 **Automatic Header & Footer**
- **Consistent navigation** across all pages
- **Responsive design** with mobile menu
- **Active page highlighting** based on current URL
- **Relative path handling** for nested pages

### 🔧 **Smart Path Resolution**
- **Automatic base path detection** for nested pages
- **Proper link generation** based on page location
- **Home page detection** for anchor links vs. page links

### 📱 **Mobile-Friendly**
- **Collapsible mobile menu** with hamburger button
- **Touch-friendly navigation** 
- **Auto-close on link click** or outside click

## Usage

### 1. **Basic Implementation**

Include the script in your HTML:

```html
<script src="src/js/common-components.js"></script>
```

The header and footer will be automatically inserted when the page loads.

### 2. **Page Template**

Use the provided template (`src/templates/page-template.html`) for new pages:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Page Title - RebootingwithAI</title>
    <!-- Required CSS and meta tags -->
</head>
<body>
    <!-- Common header will be inserted here -->
    
    <main>
        <!-- Your page content -->
    </main>
    
    <!-- Common footer will be inserted here -->
    <div data-footer-placeholder></div>
    
    <script src="../js/common-components.js"></script>
</body>
</html>
```

### 3. **Skip Components (Optional)**

To skip header or footer on specific pages:

```html
<!-- Skip header -->
<div data-skip-common-header></div>

<!-- Skip footer -->
<div data-skip-common-footer></div>
```

### 4. **Custom Placeholders**

Use specific placeholders for precise control:

```html
<!-- Header placeholder -->
<div data-header-placeholder></div>

<!-- Footer placeholder -->
<div data-footer-placeholder></div>
```

## Navigation Structure

### **Header Navigation**
- **Home** - Links to main page or #home section
- **Blog** - Links to blog section or blog index
- **Agentic Architecture** - Links to learning hub
- **News & Insights** - Links to news section or news index
- **About** - Links to about page
- **Connect** - Links to connect section

### **Footer Sections**
- **Brand Section** - Logo, description, social links
- **Quick Links** - Main navigation links
- **Resources** - Learning hub sections and GitHub
- **Copyright** - Legal information and branding

## File Structure

```
src/
├── js/
│   ├── common-components.js    # Main components file
│   ├── app.js                  # Additional functionality
│   └── README.md               # This documentation
├── templates/
│   └── page-template.html      # Template for new pages
└── css/
    └── custom-styles.css       # Shared styles
```

## Customization

### **Modify Navigation Links**

Edit the `navLinks` array in `common-components.js`:

```javascript
const navLinks = [
    { href: '...', text: 'Link Text', id: 'link-id' },
    // Add or modify links here
];
```

### **Update Footer Content**

Modify the `createFooter()` function in `common-components.js`:

```javascript
function createFooter() {
    // Customize footer HTML here
    return `<footer>...</footer>`;
}
```

### **Add Custom Styles**

Add styles to `src/css/custom-styles.css` or include in individual pages.

## Active Page Detection

The system automatically detects the current page and highlights the appropriate navigation link:

- **index.html** → Home link active
- **learning-hub.html** → Agentic Architecture link active
- **about.html** → About link active
- **Blog/News pages** → Respective links active

## Mobile Menu Behavior

- **Toggle** - Click hamburger button to open/close
- **Auto-close** - Clicking links or outside menu closes it
- **Responsive** - Hidden on desktop, visible on mobile

## Integration with Existing Pages

### **For index.html**
- Replace existing header with comment placeholder
- Add footer placeholder
- Remove duplicate mobile menu functions

### **For other pages**
- Include common-components.js script
- Add placeholders or let auto-insertion handle it
- Update page titles to include "- RebootingwithAI"

## Troubleshooting

### **Links not working?**
- Check relative paths in `getRelativePath()` function
- Verify file structure matches expected paths

### **Mobile menu not working?**
- Ensure `toggleMobileMenu()` is globally available
- Check for JavaScript errors in console

### **Styles not applying?**
- Verify Tailwind CSS is loaded
- Check custom-styles.css is included
- Ensure Font Awesome is loaded for icons

## Future Enhancements

- **Search functionality** in header
- **Theme switching** (light/dark mode)
- **Breadcrumb navigation** for nested pages
- **Analytics integration** for navigation tracking
