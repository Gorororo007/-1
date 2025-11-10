import ProductCard from './components/ProductCard'
import './App.css'

function App() {
  const products = [
    {
      id: 1,
      name: '1984',
      author: 'Джордж Оруэлл',
      price: 780,
      description: 'Антиутопический роман о тоталитарном обществе будущего, где правит Большой Брат.',
      image: 'https://images.genius.com/22d15e08fa4aa30e6b945faa565a7118.565x800x1.png'
    },
    {
      id: 2,
      name: 'Афоризмы житейской мудрости',
      author: 'Артур Шопенгауэр',
      price: 650,
      description: 'Философские размышления о счастье, жизни и мудрости от великого немецкого мыслителя.',
      image: 'https://ndc.book24.ru/resize/820x1180/pim/products/images/0e/c1/018fa19d-8a08-74e8-a768-0a9b36250ec1.jpg'
    },
    {
      id: 3,
      name: 'Война и мир',
      author: 'Лев Толстой',
      price: 850,
      description: 'Эпическое произведение о России эпохи наполеоновских войн и судьбах героев.',
      image: 'https://avatars.mds.yandex.net/get-mpic/1961245/img_id3249041197632725724.jpeg/orig'
    },
    {
      id: 4,
      name: 'Преступление и наказание',
      author: 'Фёдор Достоевский',
      price: 720,
      description: 'Психологический роман о студенте Раскольникове и его моральных терзаниях.',
      image: 'https://фантазеры.рф/wa-data/public/shop/products/62/51/165162/images/398305/398305.750x0.jpg'
    },
    {
      id: 5,
      name: 'Убийство в Восточном экспрессе',
      author: 'Агата Кристи',
      price: 690,
      description: 'Детективный роман о загадочном убийстве в поезде и расследовании Эркюля Пуаро.',
      image: 'https://cdn1.ozone.ru/s3/multimedia-5/c600/6414496301.jpg'
    },
    {
      id: 6,
      name: 'Зеленая миля',
      author: 'Стивен Кинг',
      price: 890,
      description: 'Пронзительная история о чудесах, человечности и справедливости в тюрьме.',
      image: 'https://avatars.mds.yandex.net/get-mpic/5283122/img_id1780438280299726409.jpeg/orig'
    },
    {
      id: 7,
      name: 'Дремлющий демон Декстера',
      author: 'Джефф Линдсей',
      price: 750,
      description: 'Триллер о серийном убийце Декстере Моргане и его борьбе с внутренними демонами.',
      image: 'https://r5.mt.ru/r4/photo8275/20401823019-0/jpg/bp.jpeg'
    },
    {
      id: 8,
      name: 'Так говорил Заратустра',
      author: 'Фридрих Ницше',
      price: 820,
      description: 'Философский роман о сверхчеловеке, вечном возвращении и переоценке всех ценностей.',
      image: 'https://ir.ozone.ru/s3/multimedia-2/6006572630.jpg'
    }
  ]

  return (
    <div className="app">
      <div className="background-books">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`book-icon book-icon-${i + 1} book-type-${(i % 5) + 1}`}>
            <div className="book-cover">
              <div className="book-pages"></div>
              <div className="book-lines"></div>
            </div>
            <div className="book-spine">
              <div className="spine-rings"></div>
            </div>
            {i % 7 === 0 && <div className="bookmark"></div>}
            {i % 11 === 0 && <div className="book-ribbon"></div>}
          </div>
        ))}
      </div>
      <header className="app-header">
        <div className="header-decoration header-decoration-left"></div>
        <div className="header-decoration header-decoration-right"></div>
        <div className="header-content">
          <h1 className="store-title">Gorland</h1>
          <div className="subtitle-divider"></div>
          <p className="store-subtitle">Онлайн книжный магазин</p>
          <p className="store-tagline">Откройте мир литературы</p>
        </div>
      </header>
      <div className="products-container">
        {products.map(product => (
          <ProductCard
            key={product.id}
            name={product.name}
            author={product.author}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        ))}
      </div>
      <footer className="app-footer">
      </footer>
    </div>
  )
}

export default App
