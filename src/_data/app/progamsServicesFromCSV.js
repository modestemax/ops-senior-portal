const fs = require('fs');
const Papa = require("papaparse");
const md = require('markdown-it')();
stripBom = (x) => (x.charCodeAt(0) === 0xfeff) ?  x.slice(1) : x;

// language = 'en' default (does nothing)
module.exports = async function(language = 'en') {
  // 1 master file that contains both english and french content
  const filePath =  `${__dirname}/../../assets/csv/msaa-seniors portal secondary search content-EN-FR-Feb2024-master file2.csv`;
  // Read and parse the CSV file
  const file = fs.readFileSync(filePath, 'utf-8');
  let seniorsContent = Papa.parse(stripBom(file), { // Uses the papa parse library to parse the csv data into array of objects
      header: true,
      transform: (value, header) => {
          if (header == 'Resource Description') {  // Checks if the header is a description, then markdown rendering is performed
              return md.render(value);
          }
          return value.trim();
      },
      encoding: "utf-8",
  }).data;
 
// Create 2 objects 
const englishProperties = {
  'id': 'id',
  'Resource title': 'Resource title',
  'Resource Description': 'Resource Description',
  'Resource URL': 'Resource URL',
  'Internal/External': 'Internal/External',
  'Category': 'Category',
  'Sub Category': 'Sub Category',
  'Keywords': 'Keywords'
}
const frenchProperties = {
  'id': 'id',
  'Resource title': 'Resource title FRENCH',
  'Resource Description': 'Resource Description FRENCH',
  'Resource URL': 'Resource URL FRENCH',
  'Internal/External': 'Internal/External',
  'Category': 'Category FRENCH',
  'Sub Category': 'Sub Category FRENCH',
  'Keywords': 'Keywords FRENCH'
};
// The mapRecord function maps each row of information in the record to the corresponding column name specified in the properties object
const mapRecord = (record, properties) =>
  Object.fromEntries(
    Object.keys(properties).map(
      key => [key, record[properties[key]]]
    )
  );

  // Keys: ['Resource title', 'Resource Description', 'Resource URL', 'Internal/External', 'Category', 'Sub Category']
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

  const invalidItems = seniorsContent.filter(item => !item["Resource title"] || !item["Resource Description"] || !item["Category"] || !item["Resource URL"] || !item["Internal/External"] || !item["Sub Category"] || !item["Resource title FRENCH"] || !item["Resource Description FRENCH"] || !item["Category FRENCH"] || !item["Resource URL FRENCH"] || !item["Internal/External FRENCH"] || !item["Sub Category FRENCH"]);
  if (invalidItems.length > 0) { 
    console.error("Error: Some items have null values in Resource Title (French), Resource Description (French),  Resource URL (French), Internal/External (French), Category or Sub Category (French):");
    console.error(invalidItems);
    // throw new CustomException('Some items have invalid records.');
   // If the line above is uncommented, it will shut down the whole program 
  }
  
  // Function that creates category tags for the language "lang" passed to it
  function createCategory(lang) {

    // Creates a map of all the category tags of that lang
    let categories = seniorsContent.map(seniorsContent => seniorsContent[lang]);
    // let subCategories = seniorsContent.map(seniorsContent => seniorsContent["Sub Category"]);
    
    // Undefined checker
    categories = categories.map(function(__string) {
      if (__string != undefined) {
        return __string;
      }
      return '';
    });
    // Returns a set of tags for the corresponding language passed to it
    return [...new Set(categories)].sort();
  }

  let uniqueTagsEN = createCategory("Category");
  let uniqueTagsFR = createCategory("Category FRENCH");

// Filter both English and French content
const englishContent = (records) => records.map((record) => mapRecord(record, englishProperties))
const frenchContent = (records) => records.map((record) => mapRecord(record, frenchProperties))

// seniorsContentEN and seniorsContentFR are both arrays holding the english and french content
const seniorsContentEN = englishContent(seniorsContent);
const seniorsContentFR = frenchContent(seniorsContent);

// Return both arrays
  return {
    seniorsContent: {
      'en': seniorsContentEN,
      'fr': seniorsContentFR
    },
    tags: uniqueTagsEN, uniqueTagsFR
  };
};
