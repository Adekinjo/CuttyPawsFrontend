import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import '../../style/CategoryCarousel.css';

// Import images for each category
import DogCategory from '../../images/dog.png';
import CatImage from '../../images/cat.png';
import BirdsImage from '../../images/birds.png';
import FishImages from '../../images/fish.png';

const CategoryCarousel = () => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
    ],
  };

  const categories = [
    {
      id: 1,
      name: 'Dog Accessories',
      route: '/category/1', 
      image: DogCategory,
      description: 'Durable dog accessories for every adventure, from leashes and harnesses to travel gear and toys.',
    },
    {
      id: 2,
      name: "Cat Accessories" ,
      route: '/category/2',
      image: CatImage,
      description: 'Stylish cat accessories with comfort in mind, including collars, carriers, and playful hideaway tents.',
    },
    {
      id: 3,
      name: "Bird Accessories",
      route: '/category/3',
      image: BirdsImage,
      description: 'Happy chirps guaranteed! Cages, perches, toys, and nutrition for your feathered companions.',
    },
    {
      id: 4,
      name: 'Fish Accessories',
      route: '/category/4',
      image: FishImages,
      description: 'Create a beautiful underwater world! Tanks, filters, decorations, and food for fish and aquatic pets.',
    },
  ];

  const handleCategoryClick = (route) => {
    navigate(route);
  };

  return (
    <div className="category-carousel">
      <Slider {...settings}>
        {categories.map((category) => (
          <div key={category.id} className="category-slide" onClick={() => handleCategoryClick(category.route)}>
            <div className="slide-content">
              <div className="category-image"
                style={{ backgroundImage: `url(${category.image})` }}
              ></div>

              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CategoryCarousel;