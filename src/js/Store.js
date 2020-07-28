export default class Store {
  static addCategory(listEl) {
    const list = Store.getList();

    list.push(listEl);
    localStorage.setItem('list', JSON.stringify(list));
  }

  static addProduct(product, category) {
    const list = Store.getList();

    list[Store.getCategoryIndex(category)].products.push(product);
    localStorage.setItem('list', JSON.stringify(list));
  }

  static changeProductIndex(newIndex, oldIndex, category) {
    const list = Store.getList();
    const categoryIndex = Store.getCategoryIndex(category);
    const tempProduct = list[categoryIndex].products.splice(oldIndex, 1)[0];

    list[categoryIndex].products.splice(newIndex, 0, tempProduct);
    localStorage.setItem('list', JSON.stringify(list));
  }

  static changeListIndex(newIndex, oldIndex) {
    const list = Store.getList();
    const tempList = list.splice(oldIndex, 1)[0];

    list.splice(newIndex, 0, tempList);
    localStorage.setItem('list', JSON.stringify(list));
  }

  static clearList() {
    localStorage.clear();
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

  static getItem(index, category) {
    return Store.getList()[Store.getCategoryIndex(category)].products[index];
  }

  static getList() {
    if (localStorage.getItem('list') === null) return [];
    return JSON.parse(localStorage.getItem('list'));
  }

  static removeProduct(index, category) {
    const list = Store.getList();
    const categoryIndex = Store.getCategoryIndex(category);

    list[categoryIndex].products.splice(index, 1);
    if (!list[categoryIndex].products.length) list.splice(categoryIndex, 1);

    localStorage.setItem('list', JSON.stringify(list));
  }

  static toggleListExpand(category, value) {
    const list = Store.getList();

    list[Store.getCategoryIndex(category)].expand = value;
    localStorage.setItem('list', JSON.stringify(list));
  }

  static toggleProductChecked(index, category, value) {
    const list = Store.getList();

    list[Store.getCategoryIndex(category)].products[index].checked = value;
    localStorage.setItem('list', JSON.stringify(list));
  }

  static updateProduct(product, index, category) {
    const list = Store.getList();

    list[Store.getCategoryIndex(category)].products[index] = product;
    localStorage.setItem('list', JSON.stringify(list));
  }
}
