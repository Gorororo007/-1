import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../api/orders'
import { getErrorMessage } from '../../utils/errorHandler'
import './Management.css'

function OrdersManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU')
  }

  const getPaymentMethod = (transactionNumber) => {
    if (!transactionNumber) return 'Не указан'
    if (transactionNumber.startsWith('CARD-')) return 'Банковская карта'
    if (transactionNumber.startsWith('CASH-')) return 'Наличные при получении'
    if (transactionNumber.startsWith('ONLINE-')) return 'Онлайн платеж'
    return 'Неизвестно'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'status-pending'
      case 'processing':
        return 'status-processing'
      case 'shipped':
        return 'status-shipped'
      case 'delivered':
        return 'status-delivered'
      case 'cancelled':
        return 'status-cancelled'
      default:
        return ''
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError(null)
      await updateOrderStatus(orderId, newStatus)
      await loadOrders()
      if (selectedOrder && selectedOrder.order_id === orderId) {
        const updated = await getOrders()
        const updatedOrder = updated.find(o => o.order_id === orderId)
        if (updatedOrder) {
          // парсим items если это строка
          if (typeof updatedOrder.items === 'string') {
            updatedOrder.items = JSON.parse(updatedOrder.items)
          }
          setSelectedOrder(updatedOrder)
        }
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидает',
      'new': 'Ожидает',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    }
    return statusMap[status] || status
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOrders()
      // парсим items если это строки
      const processedData = data.map(ord => {
        if (typeof ord.items === 'string') {
          try {
            ord.items = JSON.parse(ord.items)
          } catch (e) {
            ord.items = []
          }
        }
        return ord
      })
      setOrders(processedData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (loading && orders.length === 0) {
    return <div className="loading">Загрузка заказов...</div>
  }

  return (
    <div className="management">
      <div className="management-header">
        <h2>Управление заказами</h2>
      </div>

      {error && <div className="error-message">Ошибка: {error}</div>}

      {selectedOrder && (
        <div className="form-modal" onClick={() => setSelectedOrder(null)}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>Детали заказа #{selectedOrder.order_id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="btn-close">×</button>
            </div>
            <div className="order-details">
              <div className="order-info-section">
                <h4>Информация о клиенте</h4>
                <p><strong>Имя:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Адрес доставки:</strong> {selectedOrder.shipping_address || selectedOrder.delivery_address || '-'}</p>
              </div>
              <div className="order-info-section">
                <h4>Информация о заказе</h4>
                <p><strong>Дата:</strong> {formatDate(selectedOrder.order_date)}</p>
                <p><strong>Статус:</strong> 
                  <select
                    value={selectedOrder.status || selectedOrder.order_status}
                    onChange={(e) => handleStatusChange(selectedOrder.order_id, e.target.value)}
                    className={`status-select ${getStatusColor(selectedOrder.status || selectedOrder.order_status)}`}
                  >
                    <option value="pending">Ожидает</option>
                    <option value="processing">В обработке</option>
                    <option value="shipped">Отправлен</option>
                    <option value="delivered">Доставлен</option>
                    <option value="cancelled">Отменен</option>
                  </select>
                </p>
                <p><strong>Сумма:</strong> {Number(selectedOrder.total_amount).toFixed(2)} ₽</p>
                <p><strong>Способ оплаты:</strong> {getPaymentMethod(selectedOrder.transaction_number)}</p>
                {selectedOrder.transaction_number && (
                  <p><strong>Номер транзакции:</strong> {selectedOrder.transaction_number}</p>
                )}
                {selectedOrder.payment_status && (
                  <p><strong>Статус платежа:</strong> 
                    <span className={`status-badge ${selectedOrder.payment_status === 'paid' ? 'status-delivered' : selectedOrder.payment_status === 'failed' ? 'status-cancelled' : 'status-pending'}`} style={{ marginLeft: '0.5rem' }}>
                      {selectedOrder.payment_status === 'paid' && 'Оплачен'}
                      {selectedOrder.payment_status === 'pending' && 'Ожидает оплаты'}
                      {selectedOrder.payment_status === 'failed' && 'Ошибка оплаты'}
                      {selectedOrder.payment_status === 'refunded' && 'Возврат'}
                    </span>
                  </p>
                )}
              </div>
              <div className="order-info-section">
                <h4>Товары в заказе</h4>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Автор</th>
                      <th>Количество</th>
                      <th>Цена</th>
                      <th>Итого</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let items = selectedOrder.items
                      // парсим items если это строка
                      if (typeof items === 'string') {
                        try {
                          items = JSON.parse(items)
                        } catch (e) {
                          items = []
                        }
                      }
                      return Array.isArray(items) && items.length > 0 ? items.map((item, idx) => {
                      const itmPrc = Number(item.price || item.price_at_order) || 0
                      const itemTotal = item.item_total ? Number(item.item_total) : (itmPrc * item.quantity)
                      return (
                        <tr key={item.order_item_id || idx}>
                          <td>{item.product_name || '-'}</td>
                          <td>{item.product_author || '-'}</td>
                          <td>{item.quantity}</td>
                          <td>{itmPrc.toFixed(2)} ₽</td>
                          <td>{itemTotal.toFixed(2)} ₽</td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                          Товары не найдены
                        </td>
                      </tr>
                    )
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="form-actions">
              <button onClick={() => setSelectedOrder(null)} className="btn-cancel">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Email</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Способ оплаты</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.first_name} {order.last_name}</td>
                <td>{order.email}</td>
                <td>{formatDate(order.order_date)}</td>
                <td>{Number(order.total_amount).toFixed(2)} ₽</td>
                <td>{getPaymentMethod(order.transaction_number)}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(order.status || order.order_status)}`}>
                    {getStatusText(order.status || order.order_status)}
                  </span>
                </td>
                <td>
                  <button onClick={() => setSelectedOrder(order)} className="btn-edit">
                    Просмотреть
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div className="empty-state">Заказы не найдены</div>
        )}
      </div>
    </div>
  )
}

export default OrdersManagement

