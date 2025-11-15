import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { createOrder } from '../api/orders'
import { createPayment } from '../api/payments'
import './Cart.css'

function Cart() {
  const { items = [], removeFromCart, getTotalPrice, updateQuantity, loading, error, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  
  // безопасное вычисление общей стоимости
  let totalPrice = 0
  let originalTotalPrice = 0
  let totalSavings = 0
  
  try {
    if (items && Array.isArray(items) && typeof getTotalPrice === 'function') {
      totalPrice = getTotalPrice() || 0
      
      // вычисляем оригинальную сумму без скидок и экономию
      items.forEach(item => {
        if (item) {
          const originalPrice = Number(item.price) || 0
          const quantity = Number(item.quantity) || 0
          originalTotalPrice += originalPrice * quantity
        }
      })
      totalSavings = originalTotalPrice - totalPrice
    }
  } catch (err) {
    console.error('Ошибка вычисления общей стоимости:', err)
    totalPrice = 0
  }

  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Необходимо войти в систему</h2>
          <p>Войдите в систему, чтобы просмотреть корзину</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Войти
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">Загрузка корзины...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error">Ошибка: {error}</div>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>
          Вернуться в каталог
        </button>
      </div>
    )
  }

  if (!Array.isArray(items) || items.length === 0) {
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

  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(cartId)
    } else {
      await updateQuantity(cartId, newQuantity)
    }
  }

  const handleRemove = async (cartId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
      await removeFromCart(cartId)
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (items.length === 0) {
      setOrderError('Корзина пуста')
      return
    }

    if (!shippingAddress.trim()) {
      setOrderError('Введите адрес доставки')
      return
    }

    if (!paymentMethod) {
      setOrderError('Выберите способ оплаты')
      return
    }

    try {
      setIsOrdering(true)
      setOrderError(null)

      // подготавливаем данные заказа
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discounted_price: item.discounted_price || null
      }))

      const orderData = {
        user_id: user.user_id,
        items: orderItems,
        total_amount: totalPrice,
        shipping_address: shippingAddress.trim()
      }

      // создаем заказ
      const orderResult = await createOrder(orderData)
      const orderId = orderResult.order_id || orderResult.id

      // создаем платеж для заказа
      if (orderId) {
        const transactionNumber = paymentMethod === 'card' 
          ? `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          : paymentMethod === 'cash'
          ? `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          : `ONLINE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        await createPayment({
          order_id: orderId,
          payment_amount: totalPrice,
          transaction_number: transactionNumber
        })
      }
      
      // очищаем корзину после успешного создания заказа
      await clearCart()
      
      alert('Заказ успешно оформлен!')
      navigate('/')
    } catch (err) {
      setOrderError(err.message || 'Ошибка при оформлении заказа')
      console.error('Ошибка оформления заказа:', err)
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Корзина</h1>
      </div>
      <div className="cart-items">
        {items.map(item => {
          if (!item || !item.cart_id) {
            console.warn('Пропущен некорректный товар корзины:', item)
            return null
          }

          const originalPrice = Number(item.price) || 0
          const discountedPrice = item.discounted_price ? Number(item.discounted_price) : null
          const hasDiscount = discountedPrice && discountedPrice < originalPrice
          const displayPrice = hasDiscount ? discountedPrice : originalPrice
          const quantity = Number(item.quantity) || 1
          const itemTotal = displayPrice * quantity
          const imageUrl = item.image_url || item.image || 'https://via.placeholder.com/100x140?text=No+Image'
          
          return (
            <div key={item.cart_id} className="cart-item">
              {hasDiscount && (
                <div className="cart-item-discount-badge">
                  {item.discount_type === 'percentage' 
                    ? `-${item.discount_value}%` 
                    : `-${item.discount_value} ₽`}
                </div>
              )}
              <img 
                src={imageUrl} 
                alt={item.name || 'Товар'} 
                className="cart-item-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x140?text=No+Image'
                }}
              />
            <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name || 'Без названия'}</h3>
                {item.author && <p className="cart-item-author">{item.author}</p>}
              <div className="cart-item-details">
                  <div className="cart-item-price-container">
                    {hasDiscount && (
                      <span className="cart-item-price-old">{originalPrice.toFixed(2)} ₽</span>
                    )}
                    <span className="cart-item-price">{displayPrice.toFixed(2)} ₽</span>
                  </div>
                  <div className="cart-item-quantity-control">
                    <button 
                      onClick={() => handleQuantityChange(item.cart_id, quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="cart-item-quantity">Количество: {quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.cart_id, quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-total">Итого: {itemTotal.toFixed(2)} ₽</span>
              </div>
            </div>
            <button
                onClick={() => handleRemove(item.cart_id)}
              className="btn-remove"
            >
              Удалить
            </button>
          </div>
          )
        })}
      </div>
      {items.length > 0 && (
      <div className="cart-footer">
          {totalSavings > 0 && (
            <div className="cart-savings">
              <span className="cart-savings-label">Вы экономите:</span>
              <span className="cart-savings-amount">-{totalSavings.toFixed(2)} ₽</span>
            </div>
          )}
        <div className="cart-total">
            {totalSavings > 0 && (
              <div className="cart-total-original">
                <span className="cart-total-label">Сумма без скидки:</span>
                <span className="cart-total-price-old">{originalTotalPrice.toFixed(2)} ₽</span>
              </div>
            )}
            <div className="cart-total-final">
          <span className="cart-total-label">Итоговая сумма:</span>
              <span className="cart-total-price">{totalPrice ? totalPrice.toFixed(2) : '0.00'} ₽</span>
            </div>
          </div>
          <div className="shipping-form">
            <label htmlFor="shipping-address">Адрес доставки *</label>
            <textarea
              id="shipping-address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Введите адрес доставки"
              rows={3}
              className="shipping-input"
            />
          </div>
          <div className="payment-form">
            <label htmlFor="payment-method">Способ оплаты *</label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-select"
            >
              <option value="card">Банковская карта</option>
              <option value="cash">Наличные при получении</option>
              <option value="online">Онлайн платеж</option>
            </select>
          </div>
          {orderError && (
            <div className="error-message" style={{ marginTop: '1rem' }}>
              {orderError}
        </div>
          )}
          <button 
            className="btn-checkout" 
            onClick={handleCheckout}
            disabled={isOrdering || !shippingAddress.trim() || !paymentMethod}
          >
            {isOrdering ? 'Оформление...' : 'Оформить заказ'}
        </button>
      </div>
      )}
    </div>
  )
}

export default Cart

