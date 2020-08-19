const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');

Handlebars.registerHelper('toUpperCase', function(str) {
  return str.replace(/^\w/, c => c.toUpperCase());
});

module.exports = function saveRenderedTemplate (templateName, context, filePath, fileName, keepIfExists = false) {
  const combinedPath = path.join(filePath, fileName);
  if (keepIfExists && fs.existsSync(combinedPath)) {
    return;
  }
  const template = fs.readFileSync(path.join(__dirname, '../', templateName), 'utf8');
  const generateIndex = () => Handlebars.compile(template)(context);

  fs.writeFileSync(path.join(filePath, fileName), generateIndex());
};
