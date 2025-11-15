import { createContext, useContext, useState, useEffect } from 'react'
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartItem, clearCart as apiClearCart } from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // загрузка корзины при изменении юзера
  useEffect(() => {
    if (user?.user_id) {
      loadCart()
    } else {
      setItems([])
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id])

  const loadCart = async () => {
    if (!user?.user_id) {
      setItems([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getCart(user.user_id)
      // убеждаемся, что data - это массив
      if (Array.isArray(data)) {
        setItems(data)
      } else {
        console.error('Ожидался массив товаров корзины, получено:', data)
        setItems([])
        setError('Неверный формат данных корзины')
      }
    } catch (err) {
      setError(err.message || 'Ошибка загрузки корзины')
      console.error('Ошибка загрузки корзины:', err)
      setItems([]) // устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product) => {
    if (!user?.user_id) {
      setError('Необходимо войти в систему')
      return { success: false, error: 'Необходимо войти в систему' }
    }

    try {
      setError(null)
      await apiAddToCart(user.user_id, product.product_id || product.id, 1)
      await loadCart()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const removeFromCart = async (cartId) => {
    try {
      setError(null)
      await apiRemoveFromCart(cartId)
      await loadCart()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const updateQuantity = async (cartId, quantity) => {
    try {
      setError(null)
      await updateCartItem(cartId, quantity)
      await loadCart()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const clearCart = async () => {
    if (!user?.user_id) return

    try {
      setError(null)
      await apiClearCart(user.user_id)
      await loadCart()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const getTotalPrice = () => {
    if (!Array.isArray(items)) return 0
    try {
      return items.reduce((total, item) => {
        if (!item) return total
        // используем discounted_price если есть скидка, иначе обычную цену
        const originalPrice = Number(item.price) || 0
        const discountedPrice = item.discounted_price ? Number(item.discounted_price) : null
        const price = (discountedPrice && discountedPrice < originalPrice) ? discountedPrice : originalPrice
        const quantity = Number(item.quantity) || 0
        return total + (price * quantity)
      }, 0)
    } catch (err) {
      console.error('Ошибка вычисления общей стоимости корзины:', err)
      return 0
    }
  }

  const getTotalItems = () => {
    if (!Array.isArray(items)) return 0
    try {
      return items.reduce((total, item) => {
        if (!item) return total
        return total + (Number(item.quantity) || 0)
      }, 0)
    } catch (err) {
      console.error('Ошибка подсчета товаров в корзине:', err)
      return 0
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        loading,
        error,
        loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider')
  }
  return context
}

