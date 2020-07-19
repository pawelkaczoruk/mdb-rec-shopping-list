// Store class: handles storage
export default class Store {
  static getList() {
    let list;

    if (localStorage.getItem('list') === null) list = [];
    else list = JSON.parse(localStorage.getItem('list'));

    return list;
  }

  static addCategory(category) {
    const list = Store.getList();
    list.push(category);
    localStorage.setItem('list', JSON.stringify(list));
  }

  static addProduct(product, category) {
    const list = Store.getList();

    for (let i = 0; i < list.length; i++) {
      if (list[i].category === category) {
        list[i].products.push(product);
        break;
      }
    }

    localStorage.setItem('list', JSON.stringify(list));
  }

  static clearList() {
    localStorage.clear();
  }
}
