import { cartItm } from '../models/CartItem.js'
import { prdct } from '../models/Product.js'

// управление корзиной
export class cartSvc {
  constructor() {
    this.items = []
    this.listeners = []
  }

  // сколько всего товаров (с учетом количества)
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  // возвращаем все состояние корзины
  getState() {
    return {
      items: this.getItems(),
      totalPrice: this.getTotalPrice(),
      totalItems: this.getTotalItems()
    }
  }

  // говорим всем подписчикам что что-то изменилось
  notify() {
    this.listeners.forEach(listener => listener(this.getState()))
  }

  // удаляем товар по id
  removeFromCart(productId) {
    this.items = this.items.filter(item => item.getId() !== productId)
    this.notify()
  }

  // возвращаем массив товаров в удобном виде
  getItems() {
    return this.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      author: item.product.author,
      price: item.product.price,
      description: item.product.description,
      image: item.product.image,
      quantity: item.quantity
    }))
  }

  // очищаем всю корзину
  clearCart() {
    this.items = []
    this.notify()
  }

  // считаем общую сумму
  getTotalPrice() {
    return this.items.reduce((total, item) => total + item.getTotalPrice(), 0)
  }

  // добавляем товар, если уже есть - увеличиваем количество
  addToCart(product) {
    const productObj = product instanceof prdct ? product : prdct.fromData(product)
    const existingItem = this.items.find(item => item.getId() === productObj.id)

    if (existingItem) {
      existingItem.increaseQuantity()
    } else {
      this.items.push(new cartItm(productObj))
    }

    this.notify()
  }

  // подписываемся на изменения, чтобы реакт обновлялся
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

