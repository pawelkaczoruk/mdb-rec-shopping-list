import html2pdf from 'html2pdf.js';
import Sortable from 'sortablejs';
import Product from './Product';
import Store from './Store';

export default class UI {
  static addProductToList(product, category) {
    const listContent = document.querySelector(
      `#list-container div[data-category="${category}"] .list-content`
    );
    const listItem = document.createElement('div');

    listItem.className = 'list-item';
    listItem.innerHTML = UI.createListItem(product);

    listContent.appendChild(listItem);
  }

  static addSortable(category = null) {
    let container;
    let item;

    if (!category) {
      container = document.querySelector('#list-container');
      item = '.list-body';
    } else {
      container = document.querySelector(`
      #list-container div[data-category="${category}"] .list-content`);
      item = '.list-item';
    }

    Sortable.create(container, {
      animation: 150,
      draggable: item,
      onUpdate: (e) => {
        if (category === null) Store.changeListIndex(e.newIndex, e.oldIndex);
        else Store.changeProductIndex(e.newIndex, e.oldIndex, category);
      },
    });
  }

  static clearForm(form) {
    form.querySelector('.name-input').value = '';
    form.querySelector('.amount-input').value = '';
    form.querySelector('.category-input').value = '';
  }

  static clearList() {
    document.querySelectorAll('#list-container .list-body').forEach((list) => list.remove());
    UI.updateSummary();
  }

  static closeEditModal() {
    const form = document.querySelector('#edit-form');
    form.removeAttribute('data-index');
    form.removeAttribute('data-category');
    document.querySelector('.edit-modal').classList.remove('show');
  }

  static init() {
    const list = Store.getList();

    list.forEach((obj) => {
      UI.createList(obj);
      obj.products.map((product) => UI.addProductToList(product, obj.category));
      UI.updateListHeader(obj.category);
    });

    UI.updateSummary();
    UI.addSortable();
    UI.setupListeners();
  }

  static createList(obj) {
    const listContainer = document.querySelector('#list-container');
    const listSummary = listContainer.querySelector('.list-summary');
    const list = document.createElement('div');

    list.className = 'list list-body';
    list.dataset.category = `${obj.category}`;
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

    // add drag and drop
    UI.addSortable(obj.category);
  }

  static createListItem(product) {
    return `
      <div class="list-item-content">
        <input class="checkbox" type="checkbox" ${product.checked ? 'checked' : ''}/>
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
    const textElement = document.querySelector(
      `#list-container div[data-category="${category}"] .list-header span`
    );
    textElement.innerText = ` (${UI.getTotalProducts(list.products)})`;
  }

  static updateSummary() {
    const list = Store.getList();
    const text = document.querySelector('#list-container .list-summary p');

    if (!list.length) {
      text.innerText = 'Your list is empty';
      return;
    }

    const allProducts = list.reduce((acc, cur) => [...acc, ...cur.products], []);
    text.innerText = `Total ${UI.getTotalProducts(allProducts)}`;
  }

  static setEditFormValues(index, productCategory) {
    const product = Store.getItem(index, productCategory);

    document.querySelector('#edit-form .name-input').value = UI.textFormatter(product.name);
    document.querySelector('#edit-form .amount-input').value = product.amount;
    document.querySelector(`#edit-form input[value="${product.type}"]`).checked = true;
    document.querySelector('#edit-form .category-input').value = UI.textFormatter(productCategory);
  }

  static openEditModal(index, productCategory) {
    document.querySelector('.edit-modal').classList.add('show');
    UI.setEditFormValues(index, productCategory);

    const form = document.querySelector('#edit-form');
    form.dataset.index = index;
    form.dataset.category = productCategory;
  }

  static setupListeners() {
    document.querySelector('#add-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const form = document.querySelector('#add-form');
      const name = form.querySelector('.name-input').value.toLowerCase();
      const amount = Number(form.querySelector('.amount-input').value);
      const type = form.querySelector('input[name="type"]:checked').value.toLowerCase();
      const category = form.querySelector('.category-input').value.toLowerCase();
      const errorTextElement = form.querySelector('.error-message');

      if (!UI.validate(name, amount, category, errorTextElement)) return;

      const product = new Product(name, amount, type);

      if (document.querySelector(`#list-container div[data-category="${category}"]`) === null) {
        const obj = {
          category,
          expand: true,
          products: [product],
        };

        Store.addCategory(obj);
        UI.createList(obj);
      } else {
        Store.addProduct(product, category);
      }

      UI.addProductToList(product, category);
      UI.updateListHeader(category);
      UI.updateSummary();
      UI.clearForm(document.querySelector('#add-form'));
    });

    document.querySelector('#list-container .list-summary button').addEventListener('click', () => {
      document.querySelector('.alert-modal').classList.add('show');
    });

    document.querySelector('.alert-modal .cancel').addEventListener('click', () => {
      document.querySelector('.alert-modal').classList.remove('show');
    });

    document.querySelector('.alert-modal .confirm').addEventListener('click', () => {
      document.querySelector('.alert-modal').classList.remove('show');
      Store.clearList();
      UI.clearList();
    });

    document.querySelector('#list-container').addEventListener('click', (e) => {
      if (e.target.classList.contains('remove') || e.target.classList.contains('edit')) {
        const el = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
        const listItem = el.parentElement.parentElement;
        const category = listItem.parentElement.parentElement.dataset.category;
        const itemsArray = Array.from(listItem.parentNode.children);
        const index = itemsArray.indexOf(listItem);

        if (e.target.classList.contains('remove')) {
          Store.removeProduct(index, category);
          UI.removeProduct(listItem, itemsArray.length - 1);
          if (itemsArray.length - 1 > 0) UI.updateListHeader(category);
          UI.updateSummary();
        } else {
          UI.openEditModal(index, category);
        }
      } else if (e.target.classList.contains('expand')) {
        const el = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
        const list = el.parentElement.parentElement;
        const category = list.dataset.category;

        list.querySelector('.list-content').classList.toggle('list-expanded');
        el.children[0].classList.toggle('fa-caret-up');
        el.children[0].classList.toggle('fa-caret-down');

        const expanded = list.querySelector('.list-content').classList.contains('list-expanded');
        Store.setCategoryExpand(category, expanded);
      } else if (e.target.classList.contains('checkbox')) {
        const listItem = e.target.parentElement.parentElement;
        const category = listItem.parentElement.parentElement.dataset.category;
        const itemsArray = Array.from(listItem.parentNode.children);
        const index = itemsArray.indexOf(listItem);

        Store.setProductChecked(index, category, e.target.checked);
      }
    });

    document.querySelector('.edit-modal .cancel-btn').addEventListener('click', (e) => {
      e.preventDefault();
      UI.clearForm(document.querySelector('#edit-form'));
      UI.closeEditModal();
    });

    document.querySelector('#edit-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const form = document.querySelector('#edit-form');
      const name = form.querySelector('.name-input').value.toLowerCase();
      const amount = Number(form.querySelector('.amount-input').value);
      const type = form.querySelector('input[name="type"]:checked').value.toLowerCase();
      const category = form.querySelector('.category-input').value.toLowerCase();
      const errorTextElement = form.querySelector('.error-message');

      if (!UI.validate(name, amount, category, errorTextElement)) return;

      const product = Store.getItem(form.dataset.index, form.dataset.category);
      product.name = name;
      product.type = type;
      product.amount = amount;

      if (document.querySelector(`#list-container div[data-category="${category}"]`) === null) {
        const obj = {
          category,
          expand: true,
          products: [product],
        };

        Store.addCategory(obj);
        UI.createList(obj);
        Store.removeProduct(form.dataset.index, form.dataset.category);
      } else if (form.dataset.category !== category) {
        Store.addProduct(product, category);
        Store.removeProduct(form.dataset.index, form.dataset.category);
      } else {
        Store.updateProduct(product, form.dataset.index, category);
      }

      UI.clearList();
      UI.init();
      UI.clearForm(document.querySelector('#edit-form'));
      UI.closeEditModal();
    });

    document.querySelector('header button').addEventListener('click', () => {
      const drawer = document.querySelector('#drawer');
      drawer.classList.toggle('show');
    });

    document.querySelector('#print-btn').addEventListener('click', () => {
      document.querySelector('#drawer').classList.remove('show');
      window.print();
    });

    document.querySelector('#export-pdf').addEventListener('click', () => {
      document.querySelector('#drawer').classList.remove('show');
      html2pdf(document.querySelector('#print-container'));
    });
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
