const fs = require('fs');

let content = fs.readFileSync('src/newtab.js', 'utf8');

const regex = /if \(settings\.showWeather\) \{\n\s*loadWeather\(\);\n\s*\}/g;
content = content.replace(regex, 'if (settings.showWeather && els.weather.hidden) {\n      loadWeather();\n    }');

fs.writeFileSync('src/newtab.js', content);
