import { useState, useEffect } from 'react'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import { apiRequest } from '../api/config'
import { useAuth } from '../contexts/AuthContext'
import ProductCard from '../components/ProductCard'
import CategoryFilter from '../components/CategoryFilter'
import './Catalog.css'

function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // загрузка категорий
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        console.error('Ошибка загрузки категорий:', err)
      }
    }
    loadCategories()
  }, [])

  // загрузка продуктов
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)
        
        // отправляем массив выбранных категорий на backend
        const categoryIds = selectedCategories.length > 0 ? selectedCategories : null
        const userId = user?.user_id || null
        
        // если выбраны категории, отправляем все id
        let data
        if (categoryIds && categoryIds.length > 0) {
          // отправляем каждый id категории как отдельный параметр
          const params = new URLSearchParams()
          categoryIds.forEach(id => params.append('category_id', id))
          if (userId) params.append('user_id', userId)
          
          data = await apiRequest(`/products?${params.toString()}`)
        } else {
          data = await getProducts(null, userId)
        }
        
        // убеждаемся, что data - это массив
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error('Ожидался массив товаров, получено:', data)
          setProducts([])
          setError('Неверный формат данных')
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки товаров')
        console.error('Ошибка загрузки товаров:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [selectedCategories, user])

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  // продукты уже отфильтрованы на backend
  const filteredProducts = products

  if (loading) {
    return (
      <div className="catalog-page">
        <div className="loading">Загрузка товаров...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="catalog-page">
        <div className="error">Ошибка: {error}</div>
      </div>
    )
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>Каталог книг</h1>
        <p>Выберите книги для добавления в корзину</p>
      </div>
      <div className="catalog-content">
        <CategoryFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />
      <div className="products-container">
          {filteredProducts.length === 0 ? (
            <div className="no-products">Товары не найдены</div>
          ) : (
            filteredProducts.map(product => (
          <ProductCard
                key={product.product_id}
                id={product.product_id}
            name={product.name}
            author={product.author}
            price={product.price}
                discountedPrice={product.discounted_price}
                discountType={product.discount_type}
                discountValue={product.discount_value}
            description={product.description}
                image={product.image_url}
                status={product.status}
          />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Catalog

