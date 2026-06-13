const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let filepath = path.join(dir, file);
    let stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkSync(filepath, callback);
    } else {
      callback(filepath);
    }
  });
}

const replaceRules = [
  // Exact class matches with boundaries (to avoid messing up things like hover:bg-black)
  // Actually, we do want to change hover:bg-black to hover:bg-white.
  // We can just replace the specific words.
  { regex: /bg-black/g, replace: 'bg-white' },
  { regex: /text-white/g, replace: 'text-black' },
  { regex: /border-white/g, replace: 'border-black' },
  
  // Specific zinc color for nav
  { regex: /text-zinc-300/g, replace: 'text-zinc-700' },
  
  // Specific colors in globals.css
  { regex: /color-scheme: dark;/g, replace: 'color-scheme: light;' },
  { regex: /background: #050505;/g, replace: 'background: #f5f5f5;' },
  { regex: /background: #222;/g, replace: 'background: #ddd;' },
  { regex: /background: #444;/g, replace: 'background: #bbb;' },
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  walkSync(dir, (filepath) => {
    if (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.css')) {
      let content = fs.readFileSync(filepath, 'utf8');
      let newContent = content;
      
      replaceRules.forEach(rule => {
        newContent = newContent.replace(rule.regex, rule.replace);
      });

      if (content !== newContent) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`Updated ${filepath}`);
      }
    }
  });
});

console.log("Done theme swap!");
