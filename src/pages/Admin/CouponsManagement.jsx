import { useState, useEffect } from 'react'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/coupons'
import { getProducts } from '../../api/products'
import { getUsers } from '../../api/users'
import { getErrorMessage } from '../../utils/errorHandler'
import './Management.css'

function CouponsManagement() {
  const [coupons, setCoupons] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    coupon_code: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    status: 'active',
    user_id: '',
    product_id: ''
  })

  useEffect(() => {
    loadCoupons()
    loadProducts()
    loadUsers()
  }, [])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCoupons()
      setCoupons(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      coupon_code: '',
      discount_type: 'percentage',
      discount_value: '',
      start_date: '',
      end_date: '',
      status: 'active',
      user_id: '',
      product_id: ''
    })
    setEditingCoupon(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const couponData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        user_id: formData.user_id ? parseInt(formData.user_id) : null,
        product_id: formData.product_id ? parseInt(formData.product_id) : null
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon.coupon_id, couponData)
      } else {
        await createCoupon(couponData)
      }

      resetForm()
      loadCoupons()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      coupon_code: coupon.coupon_code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value?.toString() || '',
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      status: coupon.status || 'active',
      user_id: coupon.user_id?.toString() || '',
      product_id: coupon.product_id?.toString() || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот купон?')) return
    
    try {
      setError(null)
      await deleteCoupon(id)
      loadCoupons()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading && coupons.length === 0) {
    return <div className="loading">Загрузка купонов...</div>
  }

  return (
    <div className="management">
      <div className="management-header">
        <h2>Управление купонами</h2>
        <button onClick={() => setShowForm(true)} className="btn-add">
          + Добавить купон
        </button>
      </div>

      {error && <div className="error-message">Ошибка: {error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-container">
            <div className="form-header">
              <h3>{editingCoupon ? 'Редактировать купон' : 'Добавить купон'}</h3>
              <button onClick={resetForm} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Код купона *</label>
                <input
                  type="text"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Тип скидки *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    required
                  >
                    <option value="percentage">Процент</option>
                    <option value="fixed_amount">Фиксированная сумма</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Значение скидки *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Дата начала *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Дата окончания *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Товар (оставьте пустым для общей скидки)</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  >
                    <option value="">Общая скидка</option>
                    {products.map(product => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Пользователь (для персонального купона)</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  >
                    <option value="">Общий купон (для всех)</option>
                    {users.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Отмена
                </button>
                <button type="submit" className="btn-save">
                  {editingCoupon ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Код</th>
              <th>Тип</th>
              <th>Значение</th>
              <th>Период действия</th>
              <th>Товар / Пользователь</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.coupon_id}>
                <td>{coupon.coupon_id}</td>
                <td>{coupon.coupon_code}</td>
                <td>{coupon.discount_type === 'percentage' ? 'Процент' : 'Фикс. сумма'}</td>
                <td>
                  {coupon.discount_type === 'percentage' 
                    ? `${coupon.discount_value}%` 
                    : `${coupon.discount_value} ₽`}
                </td>
                <td>
                  {new Date(coupon.start_date).toLocaleDateString()} - 
                  {new Date(coupon.end_date).toLocaleDateString()}
                </td>
                <td>
                  {coupon.product_id ? `Товар ID: ${coupon.product_id}` : 'На все товары'}
                  {coupon.user_id && (
                    <>
                      <br />
                      <strong>Персональный:</strong> Пользователь ID: {coupon.user_id}
                    </>
                  )}
                  {!coupon.product_id && !coupon.user_id && 'Общая скидка'}
                </td>
                <td>
                  <span className={`status-badge ${coupon.status}`}>
                    {coupon.status === 'active' ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(coupon)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(coupon.coupon_id)} className="btn-delete">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && !loading && (
          <div className="empty-state">Купоны не найдены</div>
        )}
      </div>
    </div>
  )
}

export default CouponsManagement

