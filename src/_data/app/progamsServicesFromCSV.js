const fs = require('fs');
const Papa = require("papaparse");
const md = require('markdown-it')();

stripBom = (x) => (x.charCodeAt(0) === 0xfeff) ?  x.slice(1) : x;

module.exports = async function(language = 'en') {
  // Determine the file path based on the language
  const filePath = language === 'fr'
    ? `${__dirname}/../../assets/csv/French New Seniors Content June 2023.csv`
    : `${__dirname}/../../assets/csv/English Seniors Content June 2023.csv`;

  // Read and parse the CSV file
  const file = fs.readFileSync(filePath, 'utf-8');
  let seniorsContent = Papa.parse(stripBom(file), {
      header: true,
      transform: (value, header) => {
          if (header == 'Resource Description') {
              return md.render(value);
          }
          return value.trim();
      },
      encoding: "utf-8",
  }).data;

  // Extract categories and subcategories
  let categories = seniorsContent.map(seniorsContent => seniorsContent["Category"]);
  //let subCategories = seniorsContent.map(seniorsContent => seniorsContent["Sub Category"]);
  let tags = categories;

  tags = tags.map(function(__string) {
    if (__string != undefined) {
      return __string;
    }
    return '';
  });

  let uniqueTags = [...new Set(tags)].sort();

  return {
    seniorsContent: seniorsContent,
    tags: uniqueTags
  };
};
