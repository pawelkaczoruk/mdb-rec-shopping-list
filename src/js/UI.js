import html2pdf from 'html2pdf.js';
import Sortable from 'sortablejs';
import Product from './Product';
import Store from './Store';

export default class UI {
  static addProductToList(product, category) {
    const listContent = document.querySelector(`div[data-category="${category}"] .list-content`);
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
      container = document.querySelector(`div[data-category="${category}"] .list-content`);
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
    document.querySelectorAll('.list-body').forEach((list) => list.remove());
    UI.updateSummary();
  }

  static closeEditModal() {
    const form = document.querySelector('#edit-form');

    form.removeAttribute('data-edit-index');
    form.removeAttribute('data-edit-category');

    document.querySelector('.edit-modal').classList.remove('show');
  }

  static createList(listEl) {
    const listContainer = document.querySelector('#list-container');
    const listSummary = listContainer.querySelector('.list-summary');
    const list = document.createElement('div');

    list.className = 'list list-body';
    list.dataset.category = `${listEl.category}`;
    list.innerHTML = `
      <div class="list-header">
        <p>${UI.textFormatter(listEl.category)}<span class="list-header-total"></span></p>
        <button class="expand">
          <i class="expand fas fa-caret-${listEl.expand ? 'up' : 'down'}"></i>
        </button>
      </div>
      <div class="list-content ${listEl.expand ? 'list-expanded' : ''}">
      </div>
    `;

    listContainer.insertBefore(list, listSummary);

    UI.addSortable(listEl.category);
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

  static getFormContent(form) {
    return {
      name: form.querySelector('.name-input').value.toLowerCase(),
      amount: Number(form.querySelector('.amount-input').value),
      type: form.querySelector('input[name="type"]:checked').value.toLowerCase(),
      category: form.querySelector('.category-input').value.toLowerCase(),
      textElement: form.querySelector('.error-message'),
    };
  }

  static getTotalProducts(productList) {
    const total = productList.reduce((acc, product) => {
      if (!acc.hasOwnProperty(product.type)) acc[product.type] = 0;
      acc[product.type] += product.amount;
      return acc;
    }, {});

    return `${
      total.hasOwnProperty('items') ? `${total.items} ${total.items >= 2 ? 'items' : 'item'}` : ''
    }${total.hasOwnProperty('items') && total.hasOwnProperty('kg') ? ' and ' : ''}${
      total.hasOwnProperty('kg') ? `${total.kg} kg` : ''
    }`;
  }

  static hideError(textElement) {
    textElement.classList.remove('show');
    textElement.innerText = '';
  }

  static init() {
    const list = Store.getList();

    list.forEach((listEl) => {
      UI.createList(listEl);
      listEl.products.forEach((product) => UI.addProductToList(product, listEl.category));
      UI.updateListHeader(listEl.category);
    });

    UI.updateSummary();
    UI.addSortable();
  }

  static openEditModal(index, category) {
    const form = document.querySelector('#edit-form');

    form.dataset.editIndex = index;
    form.dataset.editCategory = category;

    document.querySelector('.edit-modal').classList.add('show');
  }

  static removeProduct(listItem, size) {
    if (size === 0) listItem.parentElement.parentElement.remove();
    else listItem.remove();
  }

  static setEditFormValues(index, category) {
    const product = Store.getItem(index, category);

    document.querySelector('#edit-form .name-input').value = UI.textFormatter(product.name);
    document.querySelector('#edit-form .amount-input').value = product.amount;
    document.querySelector(`#edit-form input[value="${product.type}"]`).checked = true;
    document.querySelector('#edit-form .category-input').value = UI.textFormatter(category);
  }

  static showError(messages, textElement) {
    textElement.classList.add('show');
    textElement.innerText = messages.join(', ');
  }

  static textFormatter(text) {
    return text[0].toUpperCase() + text.slice(1);
  }

  static updateListHeader(category) {
    const products = Store.getList()[Store.getCategoryIndex(category)].products;

    document.querySelector(
      `div[data-category="${category}"] .list-header-total`
    ).innerText = ` (${UI.getTotalProducts(products)})`;
  }

  static updateSummary() {
    const list = Store.getList();
    const text = document.querySelector('.list-summary-text');

    if (!list.length) {
      text.innerText = 'Your list is empty';
      return;
    }

    const productList = list.reduce((acc, cur) => [...acc, ...cur.products], []);
    text.innerText = `Total ${UI.getTotalProducts(productList)}`;
  }

  static setupListeners() {
    document.querySelector('#add-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const formContent = UI.getFormContent(document.querySelector('#add-form'));
      if (!UI.validate(formContent)) return;

      const product = new Product(formContent);
      const category = formContent.category;

      if (document.querySelector(`div[data-category="${category}"]`) === null) {
        const listEl = {
          category,
          expand: true,
          products: [product],
        };

        Store.addCategory(listEl);
        UI.createList(listEl);
      } else {
        Store.addProduct(product, category);
      }

      UI.addProductToList(product, category);
      UI.updateListHeader(category);
      UI.updateSummary();
      UI.clearForm(document.querySelector('#add-form'));
    });

    document.querySelector('.list-summary button').addEventListener('click', () => {
      document.querySelector('.alert-modal').classList.add('show');
    });

    document.querySelector('.alert-modal .cancel-btn').addEventListener('click', () => {
      document.querySelector('.alert-modal').classList.remove('show');
    });

    document.querySelector('.alert-modal .confirm-btn').addEventListener('click', () => {
      document.querySelector('.alert-modal').classList.remove('show');
      Store.clearList();
      UI.clearList();
    });

    document.querySelector('#list-container').addEventListener('click', ({ target }) => {
      const classList = target.classList;

      if (classList.contains('remove') || classList.contains('edit')) {
        const el = target.tagName === 'BUTTON' ? target : target.parentNode;
        const listItem = el.parentElement.parentElement;
        const category = listItem.parentElement.parentElement.dataset.category;
        const itemsArray = Array.from(listItem.parentNode.children);
        const index = itemsArray.indexOf(listItem);

        if (classList.contains('remove')) {
          Store.removeProduct(index, category);
          UI.removeProduct(listItem, itemsArray.length - 1);
          if (itemsArray.length - 1 > 0) UI.updateListHeader(category);
          UI.updateSummary();
        } else {
          UI.openEditModal(index, category);
          UI.setEditFormValues(index, category);
        }
      } else if (classList.contains('expand')) {
        const el = target.tagName === 'BUTTON' ? target : target.parentNode;
        const list = el.parentElement.parentElement;
        const category = list.dataset.category;

        list.querySelector('.list-content').classList.toggle('list-expanded');
        el.children[0].classList.toggle('fa-caret-up');
        el.children[0].classList.toggle('fa-caret-down');

        const expanded = list.querySelector('.list-content').classList.contains('list-expanded');
        Store.toggleListExpand(category, expanded);
      } else if (classList.contains('checkbox')) {
        const listItem = target.parentElement.parentElement;
        const category = listItem.parentElement.parentElement.dataset.category;
        const itemsArray = Array.from(listItem.parentNode.children);
        const index = itemsArray.indexOf(listItem);

        Store.toggleProductChecked(index, category, target.checked);
      }
    });

    document.querySelector('.edit-modal .cancel-btn').addEventListener('click', (e) => {
      e.preventDefault();
      UI.clearForm(document.querySelector('#edit-form'));
      UI.hideError(document.querySelector('#edit-form .error-message'));
      UI.closeEditModal();
    });

    document.querySelector('#edit-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const form = document.querySelector('#edit-form');
      const formContent = UI.getFormContent(form);
      if (!UI.validate(formContent)) return;

      const newCategory = formContent.category;
      const oldCategory = form.dataset.editCategory;
      const index = form.dataset.editIndex;
      const product = Store.getItem(index, form.dataset.editCategory);

      product.name = formContent.name;
      product.type = formContent.type;
      product.amount = formContent.amount;

      if (document.querySelector(`div[data-category="${newCategory}"]`) === null) {
        const listEl = {
          category: newCategory,
          expand: true,
          products: [product],
        };

        Store.addCategory(listEl);
        UI.createList(listEl);
        Store.removeProduct(index, oldCategory);
      } else if (oldCategory !== newCategory) {
        Store.addProduct(product, newCategory);
        Store.removeProduct(index, oldCategory);
      } else {
        Store.updateProduct(product, index, newCategory);
      }

      UI.clearList();
      UI.init();
      UI.clearForm(form);
      UI.closeEditModal();
    });

    document.querySelector('header button').addEventListener('click', () => {
      document.querySelector('#drawer').classList.toggle('show');
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

  static validate({ name, amount, category, textElement }) {
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
