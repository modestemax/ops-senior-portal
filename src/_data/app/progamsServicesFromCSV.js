const fs = require('fs');
const Papa = require("papaparse");
const md = require('markdown-it')();
stripBom = (x) => (x.charCodeAt(0) === 0xfeff) ?  x.slice(1) : x;

// language = 'en' default (does nothing)
module.exports = async function(language = 'en') {
  // 1 master file
  const filePath =  `${__dirname}/../../assets/csv/msaa-seniors portal secondary search content-EN-FR-Feb2024-master file2.csv`;
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
 

const englishProperties = {
  'Resource title': 'Resource title',
  'Resource Description': 'Resource Description',
  'Resource URL': 'Resource URL',
  'Internal/External': 'Internal/External',
  'Category': 'Category',
  'Sub Category': 'Sub Category',
  'Keywords': 'Keywords'
}
const frenchProperties = {
  'Resource title': 'Resource title FRENCH',
  'Resource Description': 'Resource Description FRENCH',
  'Resource URL': 'Resource URL FRENCH',
  'Internal/External': 'Internal/External FRENCH',
  'Category': 'Category FRENCH',
  'Sub Category': 'Sub Category FRENCH',
  'Keywords': 'Keywords FRENCH'
};
const mapRecord = (record, properties) =>
  Object.fromEntries(
    Object.keys(properties).map(
      key => [key, record[properties[key]]]
    )
  );

// Filter both English and French content.
const englishContent = (records) => records.map((record) => mapRecord(record, englishProperties))
const frenchContent = (records) => records.map((record) => mapRecord(record, frenchProperties))


const seniorsContentEN = englishContent(seniorsContent);
const seniorsContentFR = frenchContent(seniorsContent);
console.log("English Seniors Content array ->", seniorsContentEN[0]);
console.log("-------------------------------------------------------------------");
console.log("French Seniors Content array ->", seniorsContentFR[0]);

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
  
  function createCategory(lang) {

    let categories = seniorsContent.map(seniorsContent => seniorsContent[lang]);
    //let subCategories = seniorsContent.map(seniorsContent => seniorsContent["Sub Category"]);
    
    categories = categories.map(function(__string) {
      if (__string != undefined) {
        return __string;
      }
      return '';
    });
    return [...new Set(categories)].sort();
  }

  let uniqueTagsEN = createCategory("Category");
  let uniqueTagsFR = createCategory("Category FRENCH");

  return {
    seniorsContent: seniorsContent,
    tags: uniqueTagsEN, uniqueTagsFR

  };
};
