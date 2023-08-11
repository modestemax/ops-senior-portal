// Get all the checkboxes
const checkboxes = document.querySelectorAll('.ontario-checkboxes__input');

// Attach an event listener to each checkbox
checkboxes.forEach(checkbox => {
 checkbox.addEventListener('change', updateResult);
});

// Function to calculate and display the result
function updateResult() {
const selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);
const selectedCategories = selectedCheckboxes.map(checkbox => checkbox.value);

const categoryMap = {};

const filterItems = document.querySelectorAll('.filter-item');
filterItems.forEach(item => {
  const itemClasses = Array.from(item.classList);
  selectedCategories.forEach(category => {
    if (itemClasses.includes(category)) {
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(item);
    }
  });
});

 // Output the result
const resultDiv = document.getElementById('result');
const totalDiv = document.getElementById('total');


// Clear
resultDiv.innerHTML = '';
totalDiv.innerHTML = '';

total_results = 0;

// Separate Sections
selectedCategories.forEach((category, index) => {
const categoryItems = categoryMap[category];


// If there are items for this category, display the results
if (categoryItems && categoryItems.length > 0) {
  resultDiv.innerHTML += `<h3><strong>${categoryItems.length} results from ${getCategoryName(category)}</strong></h3>`;
  categoryItems.forEach(item => {
    const link = item.querySelector('a');
    if (link) {
      const linkText = link.textContent;
      const linkURL = link.href;
      const description = item.textContent.replace(linkText, '').trim();
      resultDiv.innerHTML += `<p><a href="${linkURL}">${linkText}</a> <br> ${description}</p>`;
      total_results +=1;
    }
  });
  if (index < selectedCategories.length - 1 && categoryItems.length > 0 && categoryItems) {
    resultDiv.innerHTML += '<hr>';
  }
}
totalDiv.innerHTML =`<h2><strong>${total_results} total results for<strong><h2>`
});


}

// Function to get the category name from the category value
function getCategoryName(category) {
 switch (category) {
     case 'filter-1':
         return 'Home and housing';
     case 'filter-2':
         return 'Health and well-being';
     case 'filter-3':
         return 'Caregiving';
     case 'filter-4':
         return 'Recreation';
     case 'filter-5':
         return 'Safety and Security';
     case 'filter-6':
         return 'Finances';
     case 'filter-7':
         return 'Employment and Learning';
     case 'filter-8':
         return 'Driving and transportation';
     default:
         return 'Unknown Category';
 }
}
