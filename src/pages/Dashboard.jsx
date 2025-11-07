import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="about-section">
        <h1>О компании</h1>
        <div className="about-content">
          <p className="intro-text">
            «Gorland» — это современный интернет-магазин книг. Мы создали платформу для всех, кто любит читать и ценит качественную литературу.
          </p>
          <p>
            Мы не просто продаём книги, а разделяем любовь наших покупателей к чтению. Нам знакомо чувство, когда хорошие романы заканчиваются слишком быстро, времени в дороге не хватает, чтобы дочитать главу, а героиня никак не может найти свою любовь. Мы знаем, как быстро летит время в компании с новинкой любимого автора и как сильно хочется растянуть это удовольствие.
          </p>
          <p>
            Помимо книг в «Gorland» можно найти канцтовары, сладости, подарочную упаковку и идеи для сюрпризов близким. Мы сами разрабатываем дизайны для многих ежедневников, закладок, товаров для творчества и других интересных вещей, поэтому кроме как в «Gorland» их больше нигде не найти.
          </p>
        </div>
      </div>

      <div className="divider"></div>

      <div className="reasons-section">
        <h2>5 причин влюбиться в «Gorland»</h2>
        <div className="reasons-list">
          <div className="reason-item">
            <div className="reason-number">1</div>
            <div className="reason-content">
              <h3>Огромный выбор</h3>
              <p>Если вы отчаялись в поисках подарка, скорее приходите в наш магазин или загляните на сайт.</p>
            </div>
          </div>
          <div className="reason-item">
            <div className="reason-number">2</div>
            <div className="reason-content">
              <h3>Удобная доставка</h3>
              <p>Вы можете сделать заказ в интернет-магазине и получить его любым удобным способом. Например, бесплатно забрать в ближайшем к дому пункте выдачи.</p>
            </div>
          </div>
          <div className="reason-item">
            <div className="reason-number">3</div>
            <div className="reason-content">
              <h3>Бонусы вместо денег</h3>
              <p>Копите бонусы и оплачивайте ими покупки – частично или целиком.</p>
            </div>
          </div>
          <div className="reason-item">
            <div className="reason-number">4</div>
            <div className="reason-content">
              <h3>Акции и скидки</h3>
              <p>Каждую неделю мы проводим интересные акции и делаем предложения, от которых невозможно отказаться. Держатели бонусной карты получают доступ к секретным акциям.</p>
            </div>
          </div>
          <div className="reason-item">
            <div className="reason-number">5</div>
            <div className="reason-content">
              <h3>Книжные подборки</h3>
              <p>Мы постоянно делаем подборки книг, чтобы вы могли легко найти ту самую.</p>
            </div>
          </div>
        </div>
        <p className="reasons-footer">На самом деле, причин намного больше — убедитесь в этом сами.</p>
      </div>
    </div>
  )
}

export default Dashboard
