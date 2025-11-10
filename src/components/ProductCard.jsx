import { useState } from 'react'
import './ProductCard.css'

function ProductCard({ name, author, price, description, image }) {
  const [quantity, setQuantity] = useState(0)

  const handleAddToCart = () => {
    setQuantity(quantity + 1)
  }

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-author">{author}</p>
        <p className="product-description">{description}</p>
        <p className="product-price">{price} ₽</p>
        <button onClick={handleAddToCart} className="add-to-cart-btn">
          Добавить в корзину
        </button>
        {quantity > 0 && (
          <div className="quantity-display">
            Количество: {quantity}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard

