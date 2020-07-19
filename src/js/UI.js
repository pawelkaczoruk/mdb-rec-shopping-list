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

    UI.updateListSummary(list);
  }

  static addProductToList(product, category) {
    const listContent = document.querySelector(`#${category}-list .list-content`);
    const listItem = document.createElement('div');

    listItem.className = 'list-item';
    listItem.innerHTML = UI.createListItem(product);

    listContent.appendChild(listItem);
  }

  static createList(obj) {
    const listContainer = document.querySelector('#list-container');
    const listSummary = listContainer.querySelector('.list-summary');
    const list = document.createElement('div');

    list.className = 'list list-body';
    list.id = `${obj.category}-list`;
    list.innerHTML = `
      <div class="list-header">
        <p>${UI.textFormatter(obj.category)} 
          <span></span>
        </p>
        <button>
          <i class="fas fa-caret-${obj.expand ? 'up' : 'down'}"></i>
        </button>
      </div>
      <div class="list-content ${obj.expand ? 'list-expanded' : ''}">
      </div>
    `;

    listContainer.insertBefore(list, listSummary);
  }

  static clearList() {
    // remove elements from store
    Store.clearList();

    // remove elements from DOM
    const listContainer = document.querySelectorAll('#list-container .list-body');
    listContainer.forEach((elem) => elem.parentNode.removeChild(elem));

    // update total counter
    UI.updateListSummary([]);
  }

  static createListItem(product) {
    return `
      <div class="list-item-content">
        <input type="checkbox" ${product.checked ? 'checked' : ''}/>
        <p>${product.amount}${product.type === 'items' ? 'x' : ''} 
        ${product.type === 'kg' ? 'kg of' : ''} 
        ${UI.textFormatter(product.name)}
        </p>
      </div>
      <div class="list-item-actions">
        <button><i class="fas fa-pen"></i></button>
        <button><i class="fas fa-trash-alt"></i></button>
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

  static textFormatter(text) {
    return text[0].toUpperCase() + text.slice(1);
  }

  static updateListHeader(category) {
    const list = Store.getList().find((obj) => obj.category === category);

    const textElement = document.querySelector(`#${category}-list .list-header span`);
    textElement.innerText = `(${UI.getTotalProducts(list.products)})`;
  }

  static updateListSummary(list) {
    const listSummaryText = document.querySelector('#list-container .list-summary p');

    if (!list.length) {
      listSummaryText.innerText = 'Your list is empty';
      return;
    }

    const allProducts = list.reduce((acc, cur) => [...acc, ...cur.products], []);
    listSummaryText.innerText = `Total ${UI.getTotalProducts(allProducts)}`;
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
