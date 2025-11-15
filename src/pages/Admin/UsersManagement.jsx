import { useState, useEffect } from 'react'
import { getUsers, updateUser } from '../../api/users'
import './Management.css'

function UsersManagement() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    role_id: ''
  })

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    // роли обычно получаются из бд, но для простоты определим их здесь
    // в реальном приложении можно создать api endpoint для ролей
    setRoles([
      { role_id: 1, role_name: 'admin' },
      { role_id: 2, role_name: 'user' }
    ])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const userData = {
        ...formData,
        role_id: formData.role_id ? parseInt(formData.role_id) : null
      }

      await updateUser(editingUser.user_id, userData)
      resetForm()
      loadUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'active',
      role_id: user.role_id?.toString() || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      status: 'active',
      role_id: ''
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.role_id === roleId)
    return role ? role.role_name : 'unknown'
  }

  if (loading && users.length === 0) {
    return <div className="loading">Загрузка пользователей...</div>
  }

  return (
    <div className="management">
      <div className="management-header">
        <h2>Управление пользователями</h2>
      </div>

      {error && <div className="error-message">Ошибка: {error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-container">
            <div className="form-header">
              <h3>Редактировать пользователя</h3>
              <button onClick={resetForm} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Имя *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Фамилия *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Роль</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  >
                    <option value="">Выберите роль</option>
                    {roles.map(role => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name === 'admin' ? 'Администратор' : 'Пользователь'}
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
                    <option value="active">Активен</option>
                    <option value="blocked">Заблокирован</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Отмена
                </button>
                <button type="submit" className="btn-save">
                  Сохранить
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
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`role-badge ${user.role_name}`}>
                    {user.role_name === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td>{new Date(user.registration_date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="btn-edit">
                    Редактировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div className="empty-state">Пользователи не найдены</div>
        )}
      </div>
    </div>
  )
}

export default UsersManagement

