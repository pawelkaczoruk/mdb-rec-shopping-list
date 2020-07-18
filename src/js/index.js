import Product from './Product';
import UI from './UI';

// Event: displays list when document was loaded
document.addEventListener('DOMContentLoaded', UI.displayList());

// Event: add a product on form submit
document.querySelector('main form').addEventListener('submit', (e) => {
  // prevent submit
  e.preventDefault();

  // get form values
  const name = document.querySelector('#name').value.toLowerCase();
  const amount = Number(document.querySelector('#amount').value);
  const type = document.querySelector('input[name="type"]:checked').value.toLowerCase();
  const category = document.querySelector('#category').value.toLowerCase();
  const errorTextElement = document.querySelector('main form .error-message');

  // validate
  if (!UI.validate(name, amount, category, errorTextElement)) return;

  // create product
  const product = new Product(name, amount, type);

  // create new list category if there is no matching list yet
  if (document.querySelector(`#${category}-list`) === null) {
    const obj = {
      category,
      expand: true,
      products: [product],
    };

    UI.createList(obj);
  }

  // add product to store

  // add product to corresponding list
  UI.addProductToList(product, category);

  // update counters

  // clear form fields
  UI.clearForm();
});
