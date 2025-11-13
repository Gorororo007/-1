import { useCart } from '../contexts/CartContext'
import './ProductCard.css'

function ProductCard({ id, name, author, price, description, image }) {
  const { addToCart, items } = useCart()
  
  const cartItem = items.find(item => item.id === id)
  const quantity = cartItem ? cartItem.quantity : 0

  const handleAddToCart = () => {
    addToCart({ id, name, author, price, description, image })
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
          В корзину
        </button>
        {quantity > 0 && (
          <div className="quantity-display">
            В корзине: {quantity}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard

