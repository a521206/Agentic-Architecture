/**
 * Script to automatically update statistics by counting actual files
 * Run this script whenever you add new blog posts or news articles
 * 
 * Usage: node update-stats.js
 * Or include in your build process
 */

const fs = require('fs');
const path = require('path');

// Paths relative to the script location
const BLOG_DIR = path.join(__dirname, '../pages/blog');
const STATS_FILE = path.join(__dirname, '../data/stats.json');

function countHtmlFiles(directory) {
    try {
        const files = fs.readdirSync(directory);
        // Count HTML files, excluding index.html
        return files.filter(file => 
            file.endsWith('.html') && 
            file !== 'index.html'
        ).length;
    } catch (error) {
        console.error(`Error reading directory ${directory}:`, error.message);
        return 0;
    }
}

function calculateYearsJourney(startDate = '2021-01-01') {
    const start = new Date(startDate);
    const now = new Date();
    const years = Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
    return Math.max(years, 1); // At least 1 year
}

function updateStats() {
    console.log('🔄 Updating statistics...');

    // Count files (blog now includes both blog posts and news articles)
    const blogCount = countHtmlFiles(BLOG_DIR);
    const yearsJourney = calculateYearsJourney();

    console.log(`📝 Found ${blogCount} total posts (blog posts + news articles)`);
    console.log(`📅 Journey: ${yearsJourney} years`);

    // Create stats object
    const stats = {
        blog: {
            count: blogCount,
            lastUpdated: new Date().toISOString().split('T')[0]
        },
        journey: {
            years: yearsJourney,
            startDate: '2021-01-01'
        },
        keyOfferings: 1,
        totalViews: 10000 + (blogCount * 100), // Estimated
        subscribers: 250 + (blogCount * 5) // Estimated growth
    };
    
    // Ensure directory exists
    const statsDir = path.dirname(STATS_FILE);
    if (!fs.existsSync(statsDir)) {
        fs.mkdirSync(statsDir, { recursive: true });
    }
    
    // Write stats file
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
        console.log('✅ Statistics updated successfully!');
        console.log(`📊 Stats saved to: ${STATS_FILE}`);
    } catch (error) {
        console.error('❌ Error writing stats file:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    updateStats();
}

module.exports = { updateStats, countHtmlFiles, calculateYearsJourney };
