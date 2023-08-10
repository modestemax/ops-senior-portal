const fs = require('fs');
const Papa = require("papaparse");

module.exports = async function(language = 'en') {
  // Determine the file path based on the language
  const filePath = language === 'fr'
    ? `${__dirname}/../../assets/csv/French New Seniors Content June 2023.csv`
    : `${__dirname}/../../assets/csv/English Seniors Content June 2023.csv`;

  // Read and parse the CSV file
  const file = fs.readFileSync(filePath, 'utf-8');
  let seniorsContent = Papa.parse(file, {
      header: true,
      transform: function(_v) { return _v.trim(); },
      encoding: "utf-8",
  }).data;

  // Extract categories and subcategories
  let categories = seniorsContent.map(seniorsContent => seniorsContent["Category"]);
  let subCategories = seniorsContent.map(seniorsContent => seniorsContent["Sub Category"]);
  let tags = categories.concat(subCategories);

  tags = tags.map(function(__string) {
    if (__string != undefined) {
      return __string.toLowerCase();
    }
    return '';
  });

  let uniqueTags = [...new Set(tags)].sort();

  return {
    seniorsContent: seniorsContent,
    tags: uniqueTags
  };
};
