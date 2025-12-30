import { useNavigate, Link } from 'react-router-dom';
import '../../style/Categories.css'; 
import DogImage from '../../images/dog.png';
import CatImage from "../../images/cat.png";
import BirdImage from "../../images/birds.png";
import FishImage from "../../images/fish.png";

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Dog', image: DogImage },
    { id: 2, name: 'Cat', image: CatImage },
    { id: 3, name: "Birds", image: BirdImage },
    { id: 4, name: "Fish", image: FishImage },
  ];

  // Function to handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className='main-container'>
      <div className='cat' style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <h3 className="category-heading" style={{marginTop: "10px", paddingTop:"10px", color: "black"}}>Top Categories</h3>
        <Link  to="/categories" style={{color: "black", textDecoration: "none", fontSize: "1.2rem", marginTop: "30px"}}>
          see all
        </Link>      </div>
      <div className="categories-container1">
        {categories.map((category) => (
          <div key={category.id} className="category-item1" onClick={() => handleCategoryClick(category.id)}>
            <img src={category.image} alt={category.name} className="category-image1" />
            <p className="category-name">{category.name}</p>
          </div>
        ))}
      </div>
    </div>  
  );
};

export default Categories;