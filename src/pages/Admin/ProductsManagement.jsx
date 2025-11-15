import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'
import { getCategories } from '../../api/categories'
import { getErrorMessage } from '../../utils/errorHandler'
import './Management.css'

function ProductsManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    author: '',
    price: '',
    image_url: '',
    stock_quantity: '',
    status: 'available',
    category_id: ''
  })

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return
    
    try {
      setError(null)
      await deleteProduct(id)
      loadProducts()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      author: '',
      price: '',
      image_url: '',
      stock_quantity: '',
      status: 'available',
      category_id: ''
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      author: product.author || '',
      price: product.price || '',
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity || '',
      status: product.status || 'available',
      category_id: product.category_id || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: formData.category_id ? parseInt(formData.category_id) : null
      }

      if (editingProduct) {
        await updateProduct(editingProduct.product_id, productData)
      } else {
        await createProduct(productData)
      }

      resetForm()
      loadProducts()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading && products.length === 0) {
    return <div className="loading">Загрузка товаров...</div>
  }

  return (
    <div className="management">
      <div className="management-header">
        <h2>Управление товарами</h2>
        <button onClick={() => setShowForm(true)} className="btn-add">
          + Добавить товар
        </button>
      </div>

      {error && <div className="error-message">Ошибка: {error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-container">
            <div className="form-header">
              <h3>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</h3>
              <button onClick={resetForm} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Автор</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Цена *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Количество на складе</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Категория</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="available">Доступен</option>
                    <option value="unavailable">Недоступен</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>URL изображения</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Отмена
                </button>
                <button type="submit" className="btn-save">
                  {editingProduct ? 'Сохранить' : 'Добавить'}
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
              <th>Название</th>
              <th>Автор</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.product_id}>
                <td>{product.product_id}</td>
                <td>{product.name}</td>
                <td>{product.author || '-'}</td>
                <td>{product.price} ₽</td>
                <td>{product.category_name || '-'}</td>
                <td>
                  <span className={`status-badge ${product.status}`}>
                    {product.status === 'available' ? 'Доступен' : 'Недоступен'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(product)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(product.product_id)} className="btn-delete">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && !loading && (
          <div className="empty-state">Товары не найдены</div>
        )}
      </div>
    </div>
  )
}

export default ProductsManagement

