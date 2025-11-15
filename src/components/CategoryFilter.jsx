import './CategoryFilter.css';

function CategoryFilter({ categories = [], selectedCategories = [], onCategoryToggle }) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <aside className="category-filter">
        <h3>Категории</h3>
        <div className="category-list">
          <p>Категории не загружены</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="category-filter">
      <h3>Категории</h3>
      <div className="category-list">
        {categories.map(category => (
          <label key={category.category_id} className="category-item">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.category_id)}
              onChange={() => onCategoryToggle(category.category_id)}
            />
            <span>{category.category_name || 'Без названия'}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}

export default CategoryFilter;

