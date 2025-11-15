import { prdct } from './Product.js'

// товар в корзине с количеством
export class cartItm {
  constructor(product, quantity = 1) {
    if (product instanceof prdct) {
      this.product = product
    } else {
      this.product = prdct.fromData(product)
    }
    this.quantity = quantity
  }

  // просто возвращаем id
  getId() {
    return this.product.id
  }

  // общая цена за все штуки этого товара
  getTotalPrice() {
    return this.product.getTotalPrice(this.quantity)
  }

  // убираем штуки, но не меньше нуля
  decreaseQuantity(amount = 1) {
    this.quantity = Math.max(0, this.quantity - amount)
  }

  // добавляем еще штук
  increaseQuantity(amount = 1) {
    this.quantity += amount
  }
}

