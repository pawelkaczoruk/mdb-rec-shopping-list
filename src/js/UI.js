import Store from './Store';

// UI class: handles UI tasks
export default class UI {
  static displayList() {
    const products = Store.getProducts();

    products.forEach((obj) => {
      UI.createList(obj);
    });

    UI.updateListSummary(products);
  }

  static createList(obj) {
    const listContainer = document.querySelector('#list-container');
    const listSummary = listContainer.querySelector('.list-summary');
    const list = document.createElement('div');

    list.className = 'list';
    list.id = `${obj.category}-list`;
    list.innerHTML = `
      <div class="list-header">
        <p>${UI.textFormatter(obj.category)} 
          <span>(${UI.getTotalProducts(obj.products)})</span>
        </p>
        <button>
          <i class="fas fa-caret-${obj.expand ? 'up' : 'down'}"></i>
        </button>
      </div>
      <div class="list-content ${obj.expand ? 'list-expanded' : ''}">
        ${obj.products.map((product) => UI.createListItem(product)).join('')}
      </div>
    `;

    listContainer.insertBefore(list, listSummary);
  }

  static createListItem(product) {
    return `
      <div class="list-item">
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
    }${total.hasOwnProperty('kg') ? ` and ${total.kg} kg` : ''}`;
  }

  static textFormatter(text) {
    return text[0].toUpperCase() + text.slice(1);
  }

  static updateListSummary(products) {
    const listSummaryText = document.querySelector('#list-container .list-summary p');

    if (!products.length) {
      listSummaryText.innerText = 'Your list is empty';
      return;
    }

    const allProducts = products.reduce((acc, cur) => [...acc, ...cur.products], []);
    listSummaryText.innerText = `Total ${UI.getTotalProducts(allProducts)}`;
  }
}
