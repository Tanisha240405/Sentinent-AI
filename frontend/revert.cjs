const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'LandingPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// Remove framer-motion imports
content = content.replace(/import \{.*framer-motion.*\} from 'framer-motion';\n?/g, '');
content = content.replace(/import \{ useScrollReveal.*\} from '\.\.\/animations\/useScrollReveal';\n?/g, '');
content = content.replace(/import \{ EASING.*\} from '\.\.\/animations\/variants';\n?/g, '');
content = content.replace(/import MagneticButton.*\} from '\.\.\/components\/ui\/MagneticButton';\n?/g, '');
content = content.replace(/\/\/ @ts-nocheck\n/g, '');

// Clean out useScrollReveal variables
content = content.replace(/  const [a-zA-Z]+Reveal = useScrollReveal\(\);\n/g, '');

// Strip MagneticButton wrappers
content = content.replace(/<MagneticButton>\n/g, '');
content = content.replace(/<\/MagneticButton>\n/g, '');

// Replace <motion.div with <div
// But we need to remove variants, initial, animate, style, transition.
content = content.replace(/<motion\.([a-zA-Z0-9]+)/g, '<$1');
content = content.replace(/<\/motion\.([a-zA-Z0-9]+)>/g, '</$1>');
content = content.replace(/\s+variants=\{[^}]+\}/g, '');
content = content.replace(/\s+variants=[A-Za-z0-9_]+/g, '');
content = content.replace(/\s+initial="[^"]+"/g, '');
content = content.replace(/\s+initial=\{[^}]+\}/g, '');
content = content.replace(/\s+animate="[^"]+"/g, '');
content = content.replace(/\s+animate=\{[^}]+\}/g, '');
content = content.replace(/\s+transition=\{[^}]+\}/g, '');
content = content.replace(/\s+style=\{[^}]+\}/g, '');
content = content.replace(/\s+layoutId="[^"]+"/g, '');

fs.writeFileSync(file, content);
console.log('Done reverting LandingPage');
