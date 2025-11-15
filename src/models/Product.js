// просто класс для товара
export class prdct {
  constructor(id, name, author, price, description, image) {
    this.id = id
    this.name = name
    this.author = author
    this.price = price
    this.description = description
    this.image = image
  }

  // считаем цену с учетом количества
  getTotalPrice(quantity = 1) {
    return this.price * quantity
  }

  // создаем товар из обычного объекта
  static fromData(data) {
    return new prdct(
      data.id,
      data.name,
      data.author,
      data.price,
      data.description,
      data.image
    )
  }
}

