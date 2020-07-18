// Store class: handles storage
export default class Store {
  static getProducts() {
    return [
      {
        category: 'dairy',
        expand: true,
        products: [
          {
            name: 'milk',
            amount: 1,
            type: 'items',
            checked: false,
          },
          {
            name: 'cheese',
            amount: 0.4,
            type: 'kg',
            checked: false,
          },
          {
            name: 'butter',
            amount: 2,
            type: 'items',
            checked: true,
          },
        ],
      },
      {
        category: 'bakery',
        expand: false,
        products: [
          {
            name: 'buns',
            amount: 10,
            type: 'items',
            checked: true,
          },
        ],
      },
    ];
  }
}
