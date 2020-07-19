// Store class: handles storage
export default class Store {
  static getList() {
    let list;

    if (localStorage.getItem('list') === null) list = [];
    else list = JSON.parse(localStorage.getItem('list'));

    return list;
  }

  static getItem(index, category) {
    const list = Store.getList();
    return list[Store.getCategoryIndex(category)].products[index];
  }

  static addCategory(category) {
    const list = Store.getList();
    list.push(category);
    localStorage.setItem('list', JSON.stringify(list));
  }

  static addProduct(product, category) {
    const list = Store.getList();
    // push product to list
    list[Store.getCategoryIndex(category)].products.push(product);
    localStorage.setItem('list', JSON.stringify(list));
  }

  static updateProduct(product, index, category) {
    const list = Store.getList();
    // update product
    list[Store.getCategoryIndex(category)].products[index] = product;
    localStorage.setItem('list', JSON.stringify(list));
  }

  static changeProductIndex(newIndex, oldIndex, category) {
    const list = Store.getList();
    // update list items
    const item = list[Store.getCategoryIndex(category)].products.splice(oldIndex, 1);
    list[Store.getCategoryIndex(category)].products.splice(newIndex, 0, item[0]);
    // apply changes to store
    localStorage.setItem('list', JSON.stringify(list));
  }

  static setProductChecked(index, category, value) {
    const list = Store.getList();
    list[Store.getCategoryIndex(category)].products[index].checked = value;
    localStorage.setItem('list', JSON.stringify(list));
  }

  static setCategoryExpand(category, value) {
    const list = Store.getList();
    list[Store.getCategoryIndex(category)].expand = value;
    localStorage.setItem('list', JSON.stringify(list));
  }

  static getCategoryIndex(category) {
    const list = Store.getList();
    let index;

    for (let i = 0; i < list.length; i++) {
      if (list[i].category === category) {
        index = i;
        break;
      }
    }

    return index;
  }

  static clearList() {
    localStorage.clear();
  }

  static removeProduct(index, category) {
    const list = Store.getList();
    const categoryIndex = Store.getCategoryIndex(category);

    // remove item from category
    list[categoryIndex].products.splice(index, 1);
    // remove whole category list if there are no products in it
    if (!list[categoryIndex].products.length) list.splice(categoryIndex, 1);

    localStorage.setItem('list', JSON.stringify(list));
  }
}
