const fs = require('fs');
const Papa = require("papaparse");
const md = require('markdown-it')();

stripBom = (x) => (x.charCodeAt(0) === 0xfeff) ?  x.slice(1) : x;

// language = 'en' default (does nothing)
module.exports = async function(language = 'en') {
  // Determine the file path based on the language
  const filePath = language === 'fr'
    ? `${__dirname}/../../assets/csv/French New Seniors Content June 2023.csv`
    : `${__dirname}/../../assets/csv/New seniors portal secondary search content.csv`;
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
  // keys: ['Resource title', 'Resource Description', 'Resource URL', 'Internal/External', 'Category', 'Sub Category']
  // Check for null values in title, description, and category
  function CustomException(message) {

    const error = new Error(message);
    error.code = "INVALID_RECORDS_CODE";
    return error;

  }

  // Add a fixed ID based on index position
  seniorsContent = seniorsContent.map((resource, idx) => {
    resource["id"] = idx;
    return resource;
  })

  const invalidItems = seniorsContent.filter(item => !item["Resource title"] || !item["Resource Description"] || !item["Category"] || !item["Resource URL"] || !item["Internal/External"]|| !item["Sub Category"]);

  if (invalidItems.length > 0) {
    console.error("Error: Some items have null values in Resource Title, Resource Description,  Resource URL, Internal/External, Category or Sub Category:");
    console.error(invalidItems);
    // throw new CustomException('Some items have invalid records.');
   //^Line 39 - This is the throw exception, it will shut down the whole program if uncommented
  }
  
  // Handles both French and English Keywords
  let category = ((lang === 'en') ? "Category" : "Category FRENCH");
  let categories = seniorsContent.map(seniorsContent => seniorsContent[category]);
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
    tags: uniqueTags,

  };
};
