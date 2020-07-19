import Store from './Store';

// UI class: handles UI tasks
export default class UI {
  static displayList() {
    const list = Store.getList();

    list.forEach((obj) => {
      UI.createList(obj);
      obj.products.map((product) => UI.addProductToList(product, obj.category));
      UI.updateListHeader(obj.category);
    });

    UI.updateListSummary();
  }

  static addProductToList(product, category) {
    const listContent = document.querySelector(`#${category}-list .list-content`);
    const listItem = document.createElement('div');

    listItem.className = 'list-item';
    listItem.innerHTML = UI.createListItem(product);

    listContent.appendChild(listItem);
  }

  static clearList() {
    // remove elements from DOM
    const listContainer = document.querySelectorAll('#list-container .list-body');
    listContainer.forEach((elem) => elem.remove());

    // update total counter
    UI.updateListSummary();
  }

  static createList(obj) {
    const listContainer = document.querySelector('#list-container');
    const listSummary = listContainer.querySelector('.list-summary');
    const list = document.createElement('div');

    list.className = 'list list-body';
    list.id = `${obj.category}-list`;
    list.innerHTML = `
      <div class="list-header">
        <p>${UI.textFormatter(obj.category)}<span></span></p>
        <button class="expand">
          <i class="expand fas fa-caret-${obj.expand ? 'up' : 'down'}"></i>
        </button>
      </div>
      <div class="list-content ${obj.expand ? 'list-expanded' : ''}">
      </div>
    `;

    listContainer.insertBefore(list, listSummary);
  }

  static createListItem(product) {
    return `
      <div class="list-item-content">
        <input type="checkbox" ${product.checked ? 'checked' : ''}/>
        <p>
          <span>${product.amount}</span
          >${product.type === 'items' ? 'x' : ''} ${product.type === 'kg' ? 'kg of' : ''} <span 
          >${UI.textFormatter(product.name)}</span>
        </p>
      </div>
      <div class="list-item-actions">
        <button class="edit"><i class="edit fas fa-pen"></i></button>
        <button class="remove"><i class="remove fas fa-trash-alt"></i></button>
      </div>
    `;
  }

  static getTotalProducts(list) {
    const total = list.reduce((obj, cur) => {
      if (!obj.hasOwnProperty(cur.type)) obj[cur.type] = 0;
      obj[cur.type] += cur.amount;
      return obj;
    }, {});

    return `${
      total.hasOwnProperty('items') ? `${total.items} ${total.items >= 2 ? 'items' : 'item'}` : ''
    }${total.hasOwnProperty('items') && total.hasOwnProperty('kg') ? ' and ' : ''}${
      total.hasOwnProperty('kg') ? `${total.kg} kg` : ''
    }`;
  }

  static clearForm() {
    document.querySelector('#name').value = '';
    document.querySelector('#amount').value = '';
    document.querySelector('#category').value = '';
  }

  static removeProduct(listItem, size) {
    // remove list if it there are no items left in category else remove product
    if (size === 0) listItem.parentElement.parentElement.remove();
    else listItem.remove();
  }

  static textFormatter(text) {
    return text[0].toUpperCase() + text.slice(1);
  }

  static updateListHeader(category) {
    const list = Store.getList()[Store.getCategoryIndex(category)];
    const textElement = document.querySelector(`#${category}-list .list-header span`);
    textElement.innerText = ` (${UI.getTotalProducts(list.products)})`;
  }

  static updateListSummary() {
    const list = Store.getList();
    const listSummaryText = document.querySelector('#list-container .list-summary p');

    if (!list.length) {
      listSummaryText.innerText = 'Your list is empty';
      return;
    }

    const allProducts = list.reduce((acc, cur) => [...acc, ...cur.products], []);
    listSummaryText.innerText = `Total ${UI.getTotalProducts(allProducts)}`;
  }

  static closeEditModal() {
    document.querySelector('.edit-modal').classList.remove('show');

    // clear form inputs
    document.querySelector('#name-edit').value = '';
    document.querySelector('#amount-edit').value = '';
    document.querySelector('#category-edit').value = '';

    const form = document.querySelector('.edit-modal form');
    // clear data atributes
    form.removeAttribute('data-index');
    form.removeAttribute('data-category');
  }

  static openEditModal(index, productCategory) {
    document.querySelector('.edit-modal').classList.add('show');

    // get selected product from store
    const product = Store.getItem(index, productCategory);

    // set form inputs
    document.querySelector('#name-edit').value = UI.textFormatter(product.name);
    document.querySelector('#amount-edit').value = product.amount;
    document.querySelector(`#${product.type}-edit`).checked = true;
    document.querySelector('#category-edit').value = UI.textFormatter(productCategory);

    const form = document.querySelector('.edit-modal form');
    // save information in data atribute for ediding product
    form.dataset.index = index;
    form.dataset.category = productCategory;
  }

  static showError(messages, textElement) {
    textElement.classList.add('show');
    textElement.innerText = messages.join(', ');
  }

  static hideError(textElement) {
    textElement.classList.remove('show');
    textElement.innerText = '';
  }

  static validate(name, amount, category, textElement) {
    const errorMessages = [];

    if (name === '') errorMessages.push('name is required');
    if (amount <= 0) errorMessages.push('amount must be number higher than 0');
    if (category === '') errorMessages.push('category is required');

    if (!errorMessages.length) {
      UI.hideError(textElement);
      return true;
    }

    UI.showError(errorMessages, textElement);
    return false;
  }
}
