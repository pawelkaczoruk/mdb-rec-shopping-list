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
  const type = document
    .querySelector('main .form-container input[name="type"]:checked')
    .value.toLowerCase();
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
  UI.updateListSummary();

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

// Event: remove item from list, edit item, expand&shrink list
document.querySelector('#list-container').addEventListener('click', (e) => {
  if (
    e.target.classList.contains('remove') ||
    e.target.classList.contains('edit') ||
    e.target.classList.contains('expand')
  ) {
    // get consistent target button element, index and category
    const el = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
    const listItem = el.parentElement.parentElement;
    const category = listItem.parentElement.parentElement
      .querySelector('.list-header p')
      .innerHTML.split('<span>')[0]
      .toLowerCase();
    const itemsArray = Array.from(listItem.parentNode.children);
    const index = itemsArray.indexOf(listItem);

    if (e.target.classList.contains('remove')) {
      // remove element from store
      Store.removeProduct(index, category);
      // remove element from UI and whole category if there are no items left
      UI.removeProduct(listItem, itemsArray.length - 1);
      // update header counter
      if (itemsArray.length - 1 > 0) UI.updateListHeader(category);
      // update summary counter
      UI.updateListSummary();
    } else if (e.target.classList.contains('edit')) {
      // open modal with form for editting
      UI.openEditModal(index, category);
    } else {
      // update store value
      Store.toggleCategoryExpand(category);
      // shrink/expand category list and change icon
      listItem.querySelector('.list-content').classList.toggle('list-expanded');
      el.children[0].classList.toggle('fa-caret-up');
      el.children[0].classList.toggle('fa-caret-down');
    }
  }
});

// Event: close edit modal
document.querySelector('.edit-modal .cancel-btn').addEventListener('click', (e) => {
  // prevent default behaviour
  e.preventDefault();
  UI.closeEditModal();
});

// Event: submit edit modal
document.querySelector('.edit-modal form').addEventListener('submit', (e) => {
  // prevent default behaviour
  e.preventDefault();

  // get form values
  const name = document.querySelector('#name-edit').value.toLowerCase();
  const amount = Number(document.querySelector('#amount-edit').value);
  const type = document
    .querySelector('.edit-modal input[name="type-edit"]:checked')
    .value.toLowerCase();
  const category = document.querySelector('#category-edit').value.toLowerCase();
  const errorTextElement = document.querySelector('.edit-modal .error-message');

  // validate
  if (!UI.validate(name, amount, category, errorTextElement)) return;

  // get product and update it's values
  const form = document.querySelector('.edit-modal form');
  const product = Store.getItem(form.dataset.index, form.dataset.category);
  product.name = name;
  product.type = type;
  product.amount = amount;

  // create new list category if there is no matching list yet
  if (document.querySelector(`#${category}-list`) === null) {
    const obj = {
      category,
      expand: true,
      products: [product],
    };

    // add new category in storage with a product
    Store.addCategory(obj);
    // create new list
    UI.createList(obj);
    // remove product from previous list
    Store.removeProduct(form.dataset.index, form.dataset.category);
  } else if (form.dataset.category !== category) {
    // change product's category
    Store.addProduct(product, category);
    // remove product from previous list
    Store.removeProduct(form.dataset.index, form.dataset.category);
  } else {
    // update product value
    Store.updateProduct(product, form.dataset.index, category);
  }

  // reload list
  UI.clearList();
  UI.displayList();

  // clear form fields and close modal
  UI.closeEditModal();
});
