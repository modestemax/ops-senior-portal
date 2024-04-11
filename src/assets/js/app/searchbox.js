import Alpine from './vendor/alpine/module.esm.js';
import { EnglishStemmer } from './vendor/snowball-stem/english_stemmer.js';
import { FrenchStemmer } from './vendor/snowball-stem/french_stemmer.js';

window.Alpine = Alpine;
const stemmers = {
  en: new EnglishStemmer(),
  fr: new FrenchStemmer(),
};

const stem = function (value, language = 'en') {
  const stemmer = stemmers[language] || stemmers['en'];
  const tokenizedValue = value.split(' ');
  let stemmedValue = '';

  tokenizedValue.forEach((token, idx) => {
    let ending = idx < tokenizedValue.length - 1 ? ' ' : '';
    stemmedValue = stemmedValue + stemmer.stem(token) + ending;
  });

  //console.log(`stem("${value}", "${language}") -> "${stemmedValue}"`);
  return stemmedValue;
};

// Adapted from https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex#comment113461246_4328722
const removePunctuation = (value) => value.replace(/[^\p{L}\p{N} ]/gu, '');

// Adapted from https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const removeDiacritics = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

const removeWhitespace = (value) => value.replace(/\s+/g,'');

const stemText = function (value, language = 'en') {
  var normalized = value;
  normalized = removeDiacritics(normalized);
  normalized = removePunctuation(normalized);
  normalized = normalized.toLowerCase(); // While fuse does case-insensitive search, stemmers are case sensitive.
  normalized = stem(normalized, language);

  //console.log(`stemText("${value}", "${language}") -> "${normalized}"`);
  return normalized;
};

const concatenateText = function (value, language = 'en') {
  var normalized = value;
  normalized = removeDiacritics(normalized);
  normalized = removePunctuation(normalized);
  normalized = normalized.toLowerCase();
  normalized = removeWhitespace(normalized);
  // Stemming the concatenated result doesn't really change the index,
  // but it can make the search term match a wider set of results.
  normalized = stem(normalized, language);

  //console.log(`concatenateText("${value}", "${language}") -> "${normalized}"`);
  return normalized;
};
const normalizeData = function (data, fieldsToNormalize, language = 'en', normalize=stemText) {
  // Deep clone due to pass-by-reference fun in JS
  const clonedData = JSON.parse(JSON.stringify(data));

  const normalizedData = clonedData.map(function (resource) {
    fieldsToNormalize.forEach((field) => {
      const fieldValue = resource[field];
      resource[field] = normalize(fieldValue, language);
    });

    return resource;
  });

  return normalizedData;
};

const duplicates = (a, b) => {
  const hash = (x) => x['Resource title'] + x['Resource Description'];
  return hash(a) === hash(b);
}

const deduplicate = (results) => results.reduce(
  (acc, cur) => acc.some(x => duplicates(x, cur)) ? acc : [...acc, cur],
  []
);

document.addEventListener('alpine:init', () => {
  Alpine.data('search', () => ({
    searchTerm: '',
    lastSearchTerm: '',
    searchedAtLeastOnce: false,
    data: [],
    results: [],
    categoryCheckboxes: {},
    categories: [],
    minMatchCharLength: 1, // Default value for minMatchCharLength
    showClearAll: false,
    language: 'en', // 'en' or 'fr'.
    init() {
      // This runs first at page load, when Alpine.js initializes the data store.

      // pageLanguage and pageData are set in _head_custom.njk
      this.language = pageLanguage;
      this.data = pageData;

      // Fuse options.
      let options = {
        keys: [
          { name: 'Resource title', weight: 2 },
          { name: 'Resource Description', weight: 1 },
          { name: 'Category', weight: 1 },
          { name: 'Sub Category', weight: 1 },
          { name: 'Keywords', weight: 1 },
        ],
        includeScore: true,
        threshold: 0,
        ignoreLocation: true,
        isCaseSensitive: false,
      };

      // Create Stemmed Index.
      const fields = ['Resource title', 'Resource Description', 'Keywords', 'Category', 'Sub Category'];
      const stemmedData = normalizeData(this.data, fields, this.language, stemText);
      this.stemmedFuse = new Fuse(stemmedData, options);

      // Create Concatenated Index.
      const concatenatedData = normalizeData(this.data, fields, this.language, concatenateText);
      this.concatenatedFuse = new Fuse(concatenatedData, options);

      // Load search state, if we have any.
      this.loadSearchState();

      // Also, listen for navigation events. If the user hits forwards or back, rebuild our state.
      addEventListener('popstate', (event) => {
        this.loadSearchState();
      });
    },

    saveSearchState() {
      const params = new URLSearchParams();
      if (this.searchTerm) {
        params.append('q', this.searchTerm);
      }
      this.categories.forEach((category) => {
        params.append('category', category);
      });

      history.pushState(
        {},
        '',
        `${window.location.pathname}?${params.toString()}`
      );
    },

    loadSearchState() {
      const params = new URLSearchParams(window.location.search);
      if (params.has('q') && !params.get('q')) {
        // We have an empty query parameter, but it has actually been set.
        // This isn't likely to happen from inside the app, so the user
        // must have done an empty search from the landing page.
        this.searchedAtLeastOnce = true;
      }
      this.searchTerm = params.get('q') || '';

      this.categories = params.getAll('category');
      this.updateCheckboxes();

      // We have our state. Update the page accordingly.
      this.doSearch();
    },

    updateCategories() {
      this.categories = Object.entries(this.categoryCheckboxes)
        .map(([k, v]) => (v ? k : undefined))
        .filter((v) => v);
    },

    updateCheckboxes() {
      // Set checked boxes.
      for (const category of this.categories) {
        this.categoryCheckboxes[category] = true;
      }
      // Go through all other checkboxes and clear any unset categories.
      for (const category of Object.keys(this.categoryCheckboxes)) {
        if (!this.categories.includes(category)) {
          this.categoryCheckboxes[category] = false;
        }
      }
    },

    applyFilters() {
      // Execute the actual search with filters applied.
      this.doSearch();

      this.saveSearchState(this.searchTerm, this.categories);
      this.searchedAtLeastOnce = true;
    },

    updateCategorySelection() {
      // The clear all button will appear when there is atleast one checkbox clicked, will disappear otherwise.
      this.showClearAll = Object.values(this.categoryCheckboxes).some(
        (checked) => checked
      );

      this.updateCategories();
    },

    clearCategories() {
      // Goes through all categories and sets the value to false
      for (const category in this.categoryCheckboxes) {
        this.categoryCheckboxes[category] = false;
      }

      // Clear all button will disappear when the button is clicked
      this.showClearAll = false;

      this.updateCategories();
      if (!(this.searchTerm == '')) this.doSearch();
    },

    getMinMatchCharLength(searchTerm) {
      if (searchTerm.length > 8) {
        return 5;
      } else if (searchTerm.length < 3) {
        return 1;
      } else if (searchTerm.length < 4) {
        return 3;
      } else {
        return 4;
      }
    },

    doSearch() {
      const searchFuse = (fuse, normalize, term) => {
        const normalized = normalize(term, this.language);
        const minMatchCharLength = this.getMinMatchCharLength(normalized);
        const options = { minMatchCharLength };
        return fuse
          .search(normalized, options)
          .map((res) => res.item);
      }

      // Search both indexes, and collate the results.
      let results = [
        ...searchFuse(this.concatenatedFuse, concatenateText, this.searchTerm),
        ...searchFuse(this.stemmedFuse, stemText, this.searchTerm)
      ]
      const resultIds = results.map((resource) => resource.id);
      results = this.data.filter((resource) => {
        return resultIds.includes(resource.id);
      });
      results = deduplicate(results)

      // Apply the category filter.
      if (this.categories.length) {
        if (!this.searchTerm) {
          // User has selected a category but not entered a search term.
          results = this.data;
        }
        results = results.filter((result) =>
          this.categories.includes(result['Category'])
        );
      }

      // This updates this.results, which will trigger Alpine to update the rest of the page.
      this.results = results;
      this.lastSearchTerm = this.searchTerm;

      if (this.results.length >= 0) {
        this.showDefaultContent = false;
      } else {
        this.showDefaultContent = true;
      }
    },

    submit() {
      this.searchTerm = this.searchTerm.trim();

      // If we're executing an empty search, reload.
      if (this.searchTerm === '' && !this.categories.length) {
        this.searchedAtLeastOnce = false;
        this.saveSearchState(this.searchTerm, this.categories);
        location.reload();
      } else {
        // Execute the actual search.
        this.doSearch();
        this.saveSearchState(this.searchTerm, this.categories);
      }

      this.searchedAtLeastOnce = true;
    },

    clearSearchFilters() {
      this.searchTerm = '';
    },
  }));
});

Alpine.start();
