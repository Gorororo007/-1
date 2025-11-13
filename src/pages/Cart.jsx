import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import './Cart.css'

function Cart() {
  const { items, removeFromCart, getTotalPrice } = useCart()
  const navigate = useNavigate()
  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Корзина пуста</h2>
          <p>Добавьте товары из каталога</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Перейти в каталог
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Корзина</h1>
      </div>
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-author">{item.author}</p>
              <div className="cart-item-details">
                <span className="cart-item-price">{item.price} ₽</span>
                <span className="cart-item-quantity">Количество: {item.quantity}</span>
                <span className="cart-item-total">Итого: {item.price * item.quantity} ₽</span>
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="btn-remove"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="cart-total">
          <span className="cart-total-label">Итоговая сумма:</span>
          <span className="cart-total-price">{totalPrice} ₽</span>
        </div>
        <button className="btn-checkout">
          Оформить заказ
        </button>
      </div>
    </div>
  )
}

export default Cart

