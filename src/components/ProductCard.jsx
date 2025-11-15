import { useCart } from '../contexts/CartContext'
import './ProductCard.css'

function ProductCard({ 
  id, 
  name, 
  author, 
  price, 
  discountedPrice,
  discountType,
  discountValue,
  description, 
  image,
  status = 'available'
}) {
  const { addToCart, items } = useCart()
  
  const cartItem = items.find(item => item.product_id === id || item.id === id)
  const quantity = cartItem ? cartItem.quantity : 0

  // безопасная обработка значений
  const safePrice = Number(price) || 0
  const safeDiscountedPrice = discountedPrice ? Number(discountedPrice) : null
  const hasDiscount = safeDiscountedPrice && safeDiscountedPrice < safePrice
  const displayPrice = hasDiscount ? safeDiscountedPrice : safePrice

  // безопасная обработка изображения
  const imageUrl = image || 'https://via.placeholder.com/300x400?text=No+Image'

  const handleAddToCart = () => {
    if (status !== 'available') {
      alert('Товар недоступен')
      return
    }
    addToCart({ 
      product_id: id,
      id,
      name: name || 'Без названия', 
      author: author || '', 
      price: displayPrice,
      description: description || '', 
      image_url: image,
      image
    })
  }

  return (
    <div className="product-card">
      {hasDiscount && discountValue && (
        <div className="discount-badge">
          {discountType === 'percentage' 
            ? `-${discountValue}%` 
            : `-${discountValue} ₽`}
        </div>
      )}
      <img src={imageUrl} alt={name || 'Товар'} className="product-image" onError={(e) => {
        e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
      }} />
      <div className="product-info">
        <h3 className="product-name">{name || 'Без названия'}</h3>
        {author && <p className="product-author">{author}</p>}
        {description && <p className="product-description">{description}</p>}
        <div className="product-price-container">
          {hasDiscount && (
            <span className="product-price-old">{safePrice.toFixed(2)} ₽</span>
          )}
          <span className="product-price">{displayPrice.toFixed(2)} ₽</span>
        </div>
        <button 
          onClick={handleAddToCart} 
          className="add-to-cart-btn"
          disabled={status !== 'available'}
        >
          {status === 'available' ? 'В корзину' : 'Недоступен'}
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

