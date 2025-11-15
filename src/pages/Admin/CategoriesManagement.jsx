import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories'
import { getErrorMessage } from '../../utils/errorHandler'
import './Management.css'

function CategoriesManagement() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    display_order: '0'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return
    
    try {
      setError(null)
      await deleteCategory(id)
      loadCategories()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const resetForm = () => {
    setFormData({
      category_name: '',
      description: '',
      display_order: '0'
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      category_name: category.category_name || '',
      description: category.description || '',
      display_order: category.display_order?.toString() || '0'
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const categoryData = {
        ...formData,
        display_order: parseInt(formData.display_order)
      }

      if (editingCategory) {
        await updateCategory(editingCategory.category_id, categoryData)
      } else {
        await createCategory(categoryData)
      }

      resetForm()
      loadCategories()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading && categories.length === 0) {
    return <div className="loading">Загрузка категорий...</div>
  }

  return (
    <div className="management">
      <div className="management-header">
        <h2>Управление категориями</h2>
        <button onClick={() => setShowForm(true)} className="btn-add">
          + Добавить категорию
        </button>
      </div>

      {error && <div className="error-message">Ошибка: {error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-container">
            <div className="form-header">
              <h3>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h3>
              <button onClick={resetForm} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название категории *</label>
                <input
                  type="text"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  required
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
              <div className="form-group">
                <label>Порядок отображения</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Отмена
                </button>
                <button type="submit" className="btn-save">
                  {editingCategory ? 'Сохранить' : 'Добавить'}
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
              <th>Описание</th>
              <th>Порядок</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.category_id}>
                <td>{category.category_id}</td>
                <td>{category.category_name}</td>
                <td>{category.description || '-'}</td>
                <td>{category.display_order}</td>
                <td>
                  <button onClick={() => handleEdit(category)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(category.category_id)} className="btn-delete">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && !loading && (
          <div className="empty-state">Категории не найдены</div>
        )}
      </div>
    </div>
  )
}

export default CategoriesManagement

