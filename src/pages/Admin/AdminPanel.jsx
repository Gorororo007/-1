import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ProductsManagement from './ProductsManagement'
import CategoriesManagement from './CategoriesManagement'
import CouponsManagement from './CouponsManagement'
import OrdersManagement from './OrdersManagement'
import './AdminPanel.css'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // проверка прав админа
  if (!user || user.role_name !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="admin-access-denied">
          <h2>Доступ запрещен</h2>
          <p>Эта страница доступна только продавцам</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-panel-wrapper">
      <div className="admin-panel">
        <div className="admin-header">
        <h1>Панель продавца</h1>
        <div className="admin-user-info">
          <span>Продавец: {user.first_name} {user.last_name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Выйти
          </button>
        </div>
      </div>

      <div className="admin-nav">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Товары
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Категории
        </button>
        <button
          className={activeTab === 'coupons' ? 'active' : ''}
          onClick={() => setActiveTab('coupons')}
        >
          Купоны
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && <ProductsManagement />}
        {activeTab === 'categories' && <CategoriesManagement />}
        {activeTab === 'coupons' && <CouponsManagement />}
        {activeTab === 'orders' && <OrdersManagement />}
      </div>
      </div>
    </div>
  )
}

export default AdminPanel

