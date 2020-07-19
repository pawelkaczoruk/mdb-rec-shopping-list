import Product from './Product';
import UI from './UI';
import Store from './Store';

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

    // add new category in storage with new item
    Store.addCategory(obj);
    // create new list
    UI.createList(obj);
  } else {
    // add product to store
    Store.addProduct(product, category);
  }

  // add product to corresponding list
  UI.addProductToList(product, category);

  // update counters
  UI.updateListHeader(category);
  UI.updateListSummary(Store.getList());

  // clear form fields
  UI.clearForm();
});

// Event: clear whole list
document.querySelector('#list-container .list-summary button').addEventListener('click', () => {
  // remove elements from store
  Store.clearList();

  // remove elements from UI
  UI.clearList();
});

// Event: remove item from list
document.querySelector('#list-container').addEventListener('click', (e) => {
  if (!e.target.classList.contains('remove')) return;

  // get consistent target button element, index and category
  const el = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
  const listItem = el.parentElement.parentElement;
  const category = listItem.parentElement.parentElement
    .querySelector('.list-header p')
    .innerHTML.split('<span>')[0]
    .toLowerCase();
  const itemsArray = Array.from(listItem.parentNode.children);
  const index = itemsArray.indexOf(listItem);

  // remove element from store
  Store.removeProduct(index, category);

  // remove element from UI and whole category if there are no items left
  UI.removeProduct(listItem, itemsArray.length - 1);
});
